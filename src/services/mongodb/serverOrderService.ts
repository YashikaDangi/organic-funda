import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/mongodb/Order';
import { Order as OrderType, OrderStatus, PaymentDetails, PaymentMethod, PaymentStatus } from '@/models/Order';
import { Product } from '@/redux/slices/cartSlice';
import { Address } from '@/models/Address';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Helper function to handle MongoDB errors
const handleMongoDBError = (error: any): void => {
  // Only log detailed errors in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    if (error.name === 'ValidationError') {
      logger.db.error('MongoDB validation error', { error: error.message });
    } else if (error.name === 'MongoServerError') {
      logger.db.error('MongoDB server error', { error: error.message, code: error.code });
    } else {
      logger.db.error('MongoDB operation failed', { error: error.message || 'unknown' });
    }
  }
};

// Retry mechanism for MongoDB operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry validation errors - they won't resolve with retries
      if (error.name === 'ValidationError') {
        break;
      }
      
      // Wait before next retry with exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
};

// Helper function to generate a unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
};

// Convert MongoDB document to Order type
const convertToOrderType = (orderDoc: any): OrderType => {
  const { _id, __v, ...orderData } = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
  return {
    id: _id.toString(),
    ...orderData,
    createdAt: orderData.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: orderData.updatedAt?.toISOString() || undefined
  };
};

// Create a new order
export const createOrder = async (
  userId: string,
  items: Product[],
  shippingAddress: Address,
  billingAddress?: Address,
  paymentMethod: PaymentMethod = PaymentMethod.PAYU
): Promise<OrderType> => {
  if (!userId) {
    throw new Error('User ID is required to create an order');
  }
  
  try {
    await connectToDatabase();
    
    // Calculate order totals - no tax or shipping fees as requested
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = 0; // No tax
    const shippingCost = 0; // No shipping cost
    const discount = 0; // No discount by default
    const total = subtotal; // Total is just the subtotal of products
    
    // Create payment details
    const paymentDetails: PaymentDetails = {
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      amount: total,
      currency: 'INR'
    };
    
    // Create the order object
    const orderData = {
      userId,
      orderNumber: generateOrderNumber(),
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      tax,
      shippingCost,
      discount,
      total,
      status: OrderStatus.CREATED,
      paymentDetails,
    };
    
    const order = new Order(orderData);
    
    const savedOrder = await retryOperation(async () => {
      return await order.save();
    });
    
    logger.order.info(`Created new order ${savedOrder.orderNumber} for user ${userId}`);
    
    return convertToOrderType(savedOrder);
  } catch (error: any) {
    logger.order.error('Failed to create order', { error: error.message });
    handleMongoDBError(error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<OrderType> => {
  if (!orderId) {
    throw new Error('Order ID is required to update order status');
  }
  
  try {
    await connectToDatabase();
    
    const updatedOrder = await retryOperation(async () => {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      
      order.status = status;
      return await order.save();
    });
    
    return convertToOrderType(updatedOrder);
  } catch (error: any) {
    logger.order.error('Failed to update order status', { orderId, error: error.message });
    handleMongoDBError(error);
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

// Update payment details
export const updatePaymentDetails = async (
  orderId: string, 
  paymentDetails: Partial<PaymentDetails>
): Promise<OrderType> => {
  if (!orderId) {
    throw new Error('Order ID is required to update payment details');
  }
  
  try {
    await connectToDatabase();
    
    const updatedOrder = await retryOperation(async () => {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      
      // Update payment details
      order.paymentDetails = {
        ...order.paymentDetails,
        ...paymentDetails
      };
      
      // If payment is completed, update order status accordingly
      if (paymentDetails.paymentStatus === PaymentStatus.COMPLETED) {
        order.status = OrderStatus.PAYMENT_COMPLETED;
      } else if (paymentDetails.paymentStatus === PaymentStatus.FAILED) {
        order.status = OrderStatus.PAYMENT_FAILED;
      }
      
      return await order.save();
    });
    
    return convertToOrderType(updatedOrder);
  } catch (error: any) {
    logger.order.error('Failed to update payment details', { orderId, error: error.message });
    handleMongoDBError(error);
    throw new Error(`Failed to update payment details: ${error.message}`);
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<OrderType | null> => {
  if (!orderId) {
    return null;
  }
  
  try {
    await connectToDatabase();
    
    const order = await retryOperation(async () => {
      return await Order.findById(orderId);
    });
    
    if (!order) {
      return null;
    }
    
    return convertToOrderType(order);
  } catch (error: any) {
    logger.order.error('Failed to get order', { orderId, error: error.message });
    handleMongoDBError(error);
    return null;
  }
};

// Get order by order number
export const getOrderByNumber = async (orderNumber: string): Promise<OrderType | null> => {
  if (!orderNumber) {
    return null;
  }
  
  try {
    await connectToDatabase();
    
    const order = await retryOperation(async () => {
      return await Order.findOne({ orderNumber });
    });
    
    if (!order) {
      return null;
    }
    
    return convertToOrderType(order);
  } catch (error: any) {
    logger.order.error('Failed to get order by number', { orderNumber, error: error.message });
    handleMongoDBError(error);
    return null;
  }
};

// Get all orders for a user
export const getUserOrders = async (userId: string): Promise<OrderType[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    await connectToDatabase();
    
    const orders = await retryOperation(async () => {
      return await Order.find({ userId }).sort({ createdAt: -1 });
    });
    
    return orders.map(convertToOrderType);
  } catch (error: any) {
    logger.order.error('Failed to get user orders', { userId, error: error.message });
    handleMongoDBError(error);
    return [];
  }
};
