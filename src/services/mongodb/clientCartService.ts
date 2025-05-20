'use client';

import { Product } from '@/redux/slices/cartSlice';
import { logger } from '@/utils/logger';

// Get cart items from server API
export const getCartItems = async (userId: string): Promise<Product[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    const response = await fetch(`/api/cart?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    logger.cart.error('Error fetching cart from server:', error);
    
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Save cart items to server API
export const saveCartItems = async (userId: string, items: Product[]): Promise<void> => {
  if (!userId) {
    return;
  }
  
  try {
    // Create a clean copy of the items to ensure no circular references
    const cleanItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));
    
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        items: cleanItems,
        lastSyncedFrom: 'web-client',
        syncTimestamp: Date.now()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save cart: ${response.statusText}`);
    }
  } catch (error) {
    logger.cart.error('Error saving cart to server:', error);
    
    // Store in localStorage as backup only in non-production environments
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      try {
        localStorage.setItem(`pendingCartSync_${userId}`, JSON.stringify({
          items,
          timestamp: Date.now()
        }));
      } catch (localError) {
        // Silent fail in production
      }
    }
    
    // Re-throw the error so the caller knows it failed
    throw error;
  }
};

// Function to explicitly clear the cart
export const clearCartInServer = async (userId: string): Promise<void> => {
  if (!userId) {
    return;
  }
  
  try {
    const response = await fetch(`/api/cart?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.statusText}`);
    }
  } catch (error) {
    logger.cart.error('Error clearing cart on server:', error);
    throw error;
  }
};
