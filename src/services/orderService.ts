'use client';

import { db } from '@/lib/firebase';
import { Order, OrderStatus, PaymentDetails, PaymentMethod, PaymentStatus } from '@/models/Order';
import { Product } from '@/redux/slices/cartSlice';
import { Address } from '@/models/Address';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate a unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
};

// Create a new order
export const createOrder = async (
  userId: string,
  items: Product[],
  shippingAddress: Address,
  billingAddress?: Address,
  paymentMethod: PaymentMethod = PaymentMethod.PAYU
): Promise<Order> => {
  if (!userId) {
    throw new Error('User ID is required to create an order');
  }
  
  try {
    const orderId = uuidv4();
    const orderRef = doc(db, 'orders', orderId);
    
    // Calculate order totals
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
    const discount = 0; // No discount by default
    const total = subtotal + tax + shippingCost - discount;
    
    // Create payment details
    const paymentDetails: PaymentDetails = {
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      amount: total,
      currency: 'INR'
    };
    
    // Create the order object
    const order: Order = {
      id: orderId,
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
      createdAt: new Date().toISOString()
    };
    
    await setDoc(orderRef, order);
    logger.order.info(`Created new order ${order.orderNumber} for user ${userId}`);
    
    return order;
  } catch (error: any) {
    logger.order.error('Failed to create order', { error: error.message });
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  if (!orderId) {
    throw new Error('Order ID is required to update order status');
  }
  
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    await updateDoc(orderRef, { 
      status, 
      updatedAt: new Date().toISOString() 
    });
    
    const updatedOrder = await getDoc(orderRef);
    return updatedOrder.data() as Order;
  } catch (error: any) {
    logger.order.error('Failed to update order status', { orderId, error: error.message });
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

// Update payment details
export const updatePaymentDetails = async (
  orderId: string, 
  paymentDetails: Partial<PaymentDetails>
): Promise<Order> => {
  if (!orderId) {
    throw new Error('Order ID is required to update payment details');
  }
  
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    const currentOrder = orderDoc.data() as Order;
    const updatedPaymentDetails = {
      ...currentOrder.paymentDetails,
      ...paymentDetails,
    };
    
    await updateDoc(orderRef, { 
      paymentDetails: updatedPaymentDetails,
      updatedAt: new Date().toISOString()
    });
    
    // If payment is completed, update order status accordingly
    if (paymentDetails.paymentStatus === PaymentStatus.COMPLETED) {
      await updateDoc(orderRef, { status: OrderStatus.PAYMENT_COMPLETED });
    } else if (paymentDetails.paymentStatus === PaymentStatus.FAILED) {
      await updateDoc(orderRef, { status: OrderStatus.PAYMENT_FAILED });
    }
    
    const updatedOrder = await getDoc(orderRef);
    return updatedOrder.data() as Order;
  } catch (error: any) {
    logger.order.error('Failed to update payment details', { orderId, error: error.message });
    throw new Error(`Failed to update payment details: ${error.message}`);
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  if (!orderId) {
    return null;
  }
  
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (orderDoc.exists()) {
      return orderDoc.data() as Order;
    }
    
    return null;
  } catch (error: any) {
    logger.order.error('Failed to get order', { orderId, error: error.message });
    return null;
  }
};

// Get order by order number
export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  if (!orderNumber) {
    return null;
  }
  
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('orderNumber', '==', orderNumber),
      limit(1)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    if (!ordersSnapshot.empty) {
      return ordersSnapshot.docs[0].data() as Order;
    }
    
    return null;
  } catch (error: any) {
    logger.order.error('Failed to get order by number', { orderNumber, error: error.message });
    return null;
  }
};

// Get all orders for a user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    const orders: Order[] = [];
    ordersSnapshot.forEach((doc) => {
      orders.push(doc.data() as Order);
    });
    
    return orders;
  } catch (error: any) {
    logger.order.error('Failed to get user orders', { userId, error: error.message });
    return [];
  }
};
