'use client';

import { Order, OrderStatus, PaymentDetails, PaymentStatus } from '@/models/Order';
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
    const response = await fetch(`/api/orders/user/${userId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get user orders');
    }
    
    return data.data;
  } catch (error: any) {
    logger.payment.error('Failed to get user orders', { userId, error: error.message });
    return [];
  }
};
