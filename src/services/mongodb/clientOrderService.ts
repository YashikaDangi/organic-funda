'use client';

import { Order, OrderStatus, PaymentDetails, PaymentMethod, PaymentStatus } from '@/models/Order';
import { Address } from '@/models/Address';
import { Product } from '@/redux/slices/cartSlice';
import { logger } from '@/utils/logger';

/**
 * Get order by ID from MongoDB via API
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  if (!orderId) {
    return null;
  }
  
  try {
    // Call the API to get order details
    const response = await fetch(`/api/payment/payu/status?orderId=${orderId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get order');
    }
    
    return data.data;
  } catch (error: any) {
    logger.payment.error('Failed to get order', { orderId, error: error.message });
    return null;
  }
};

/**
 * Get order by order number from MongoDB via API
 */
export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  if (!orderNumber) {
    return null;
  }
  
  try {
    // Call the API to get order details
    const response = await fetch(`/api/orders/by-number?orderNumber=${orderNumber}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get order');
    }
    
    return data.data;
  } catch (error: any) {
    logger.payment.error('Failed to get order by number', { orderNumber, error: error.message });
    return null;
  }
};

/**
 * Get all orders for a user from MongoDB via API
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    // Call the API to get user orders
    const response = await fetch(`/api/orders?userId=${userId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get orders');
    }
    
    return data.data || [];
  } catch (error: any) {
    logger.order.error('Failed to get user orders', { userId, error: error.message });
    return [];
  }
};

/**
 * Create a new order in MongoDB via API
 */
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
    // Call the API to create an order
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        items,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create order');
    }
    
    return data.data;
  } catch (error: any) {
    logger.order.error('Failed to create order', { userId, error: error.message });
    throw error;
  }
};

/**
 * Update order status in MongoDB via API
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  if (!orderId) {
    throw new Error('Order ID is required to update status');
  }
  
  try {
    // Call the API to update order status
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update order status');
    }
    
    return data.data;
  } catch (error: any) {
    logger.order.error('Failed to update order status', { orderId, status, error: error.message });
    throw error;
  }
};

/**
 * Update payment details in MongoDB via API
 */
export const updatePaymentDetails = async (
  orderId: string, 
  paymentDetails: Partial<PaymentDetails>
): Promise<Order> => {
  if (!orderId) {
    throw new Error('Order ID is required to update payment details');
  }
  
  try {
    // Call the API to update payment details
    const response = await fetch(`/api/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentDetails }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update payment details');
    }
    
    return data.data;
  } catch (error: any) {
    logger.order.error('Failed to update payment details', { orderId, error: error.message });
    throw error;
  }
};
