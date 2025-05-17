'use client';

import { db } from '@/lib/firebase';
import { Product } from '@/redux/slices/cartSlice';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  Unsubscribe,
  FirestoreError
} from 'firebase/firestore';
import { logger } from '@/utils/logger';

// Helper function to handle Firestore errors
const handleFirestoreError = (error: any): void => {
  // Only log detailed errors in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    if (error.code === 'permission-denied') {
      logger.firestore.error('Permission denied. Check security rules and authentication state.');
    } else if (error.code === 'unavailable') {
      logger.firestore.warn('Firebase is currently unavailable. Will retry when connection is restored.');
    } else {
      logger.firestore.error('Operation failed', { code: error.code || 'unknown' });
    }
  }
};

// Retry mechanism for Firestore operations
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
      
      // Don't retry permission errors - they won't resolve with retries
      if (error.code === 'permission-denied') {
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

// Get cart items from Firestore with retry logic
export const getCartItems = async (userId: string): Promise<Product[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    return await retryOperation(async () => {
      const cartDocRef = doc(db, 'carts', userId);
      const cartDoc = await getDoc(cartDocRef);
      
      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        return cartData.items || [];
      }
      
      return [];
    });
  } catch (error) {
    handleFirestoreError(error);
    
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Save cart items to Firestore with retry logic
export const saveCartItems = async (userId: string, items: Product[]): Promise<void> => {
  if (!userId) {
    return;
  }
  
  try {
    const cartDocRef = doc(db, 'carts', userId);
    
    // Create a clean copy of the items to ensure no circular references
    const cleanItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));
    
    // Use retry operation to handle potential network issues
    await retryOperation(async () => {
      await setDoc(cartDocRef, { 
        items: cleanItems, 
        updatedAt: new Date().toISOString(),
        userId,
        lastSyncedFrom: 'web-client',
        syncTimestamp: Date.now()
      });
      return true;
    });
  } catch (error) {
    handleFirestoreError(error);
    
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

// Listen for cart changes in Firestore with error handling
export const listenToCartChanges = (
  userId: string,
  onCartUpdate: (items: Product[]) => void
): Unsubscribe => {
  if (!userId) {
    logger.cart.warn('Cannot listen to cart changes: No user ID provided');
    // Return a no-op unsubscribe function
    return () => {};
  }
  
  const cartDocRef = doc(db, 'carts', userId);
  logger.firestore.info(`Setting up real-time listener for cart changes: ${cartDocRef.path}`);
  
  return onSnapshot(
    cartDocRef, 
    (doc) => {
      if (doc.exists()) {
        const cartData = doc.data();
        logger.firestore.info(`Received cart update from Firestore for user ${userId}`, {
          itemCount: cartData.items?.length || 0,
          updatedAt: cartData.updatedAt,
          source: cartData.lastSyncedFrom || 'unknown'
        });
        onCartUpdate(cartData.items || []);
      } else {
        logger.firestore.info(`No cart document exists for user ${userId}`);
        onCartUpdate([]);
      }
    }, 
    (error: FirestoreError) => {
      handleFirestoreError(error);
      logger.firestore.error('Error listening to cart changes', { userId, errorCode: error.code });
      
      // If we have permission issues, try to fall back to local data
      if (error.code === 'permission-denied' && typeof window !== 'undefined') {
        logger.cart.warn('Permission denied, falling back to localStorage');
        try {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart) as Product[];
            logger.cart.info('Using cart data from localStorage', { itemCount: parsedCart.length });
            onCartUpdate(parsedCart);
          }
        } catch (localError) {
          logger.cart.error('Failed to load cart from localStorage', { error: localError });
        }
      }
    }
  );
};

// Function to explicitly clear the cart in Firestore
export const clearCartInFirestore = async (userId: string): Promise<void> => {
  if (!userId) {
    return;
  }
  
  try {
    const cartDocRef = doc(db, 'carts', userId);
    
    // Set an empty items array and update the timestamp
    await setDoc(cartDocRef, { 
      items: [], 
      updatedAt: new Date().toISOString(),
      userId,
      lastSyncedFrom: 'web-client',
      syncTimestamp: Date.now(),
      cleared: true // Flag to indicate this was an explicit clear operation
    });
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

// Export handleFirestoreError which wasn't previously exported
export { handleFirestoreError };
