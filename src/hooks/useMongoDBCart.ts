'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useAuth } from './useAuth';
import { 
  selectCartItems, 
  setCartItems,
  syncCartWithServer,
  fetchCartFromServer,
  Product
} from '@/redux/slices/cartSlice';
import { isEqual } from 'lodash';

/**
 * Hook to handle server-side cart operations with MongoDB
 * Provides synchronization between client and server
 */
export const useMongoDBCart = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const cartItems = useAppSelector(selectCartItems);
  
  // Use refs to track loaded state and previous cart items
  const hasLoadedRef = useRef<boolean>(false);
  const prevCartItemsRef = useRef<Product[]>([]);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load of cart from server when user authenticates
  useEffect(() => {
    // Only proceed if authenticated and not already loaded
    if (isAuthenticated && user?.uid && !hasLoadedRef.current) {
      // Fetch cart from server
      dispatch(fetchCartFromServer(user.uid))
        .then(() => {
          hasLoadedRef.current = true;
        })
        .catch(error => {
          console.error('Error fetching cart from server:', error);
        });
    }
    
    // Reset loaded state when user changes or logs out
    if (!isAuthenticated) {
      hasLoadedRef.current = false;
    }
  }, [dispatch, isAuthenticated, user]);

  // Sync cart changes to server with debouncing
  useEffect(() => {
    // Skip initial render and only sync if authenticated
    if (isAuthenticated && user?.uid && hasLoadedRef.current) {
      // Force a deep comparison of cart items to detect changes
      const itemsChanged = JSON.stringify(cartItems) !== JSON.stringify(prevCartItemsRef.current);
      
      if (itemsChanged) {
        // Clear any existing timeout
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        
        // Set a new timeout for debouncing
        syncTimeoutRef.current = setTimeout(() => {
          dispatch(syncCartWithServer({ userId: user.uid, items: [...cartItems] }))
            .unwrap()
            .catch(error => {
              // Only log errors in development
              if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to sync cart to MongoDB:', error);
              }
            });
        }, 500); // 500ms debounce
      }
    }
    
    // Always update previous cart items reference with a deep copy
    prevCartItemsRef.current = JSON.parse(JSON.stringify(cartItems));
    
    // Clean up timeout on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [dispatch, cartItems, isAuthenticated, user]);

  return {
    // The hook doesn't need to return anything as it handles syncing automatically
    // But we could expose additional functionality if needed
  };
};
