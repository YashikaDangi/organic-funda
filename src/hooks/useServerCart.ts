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
import { listenToCartChanges } from '@/services/cartService';
import { isEqual } from 'lodash';

/**
 * Hook to handle server-side cart operations with Firestore
 * Provides real-time updates across multiple devices
 */
export const useServerCart = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const cartItems = useAppSelector(selectCartItems);
  
  // Use refs to track loaded state and previous cart items
  const hasLoadedRef = useRef<boolean>(false);
  const prevCartItemsRef = useRef<Product[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

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

  // Set up real-time listener for cart changes
  useEffect(() => {
    // Only set up listener if authenticated
    if (isAuthenticated && user?.uid) {
      // Clean up previous listener if exists
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      // Set up new listener
      unsubscribeRef.current = listenToCartChanges(user.uid, (serverItems) => {
        // Only update Redux if the server items are different from current items
        // and if we've already done the initial load
        if (hasLoadedRef.current && !isEqual(serverItems, cartItems)) {
          dispatch(setCartItems(serverItems));
        }
      });
    }
    
    // Clean up listener on unmount or when auth state changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [dispatch, isAuthenticated, user]);

  // Sync cart changes to server
  useEffect(() => {
    // Skip initial render and only sync if authenticated
    if (isAuthenticated && user?.uid && hasLoadedRef.current) {
      // Force a deep comparison of cart items to detect changes
      const itemsChanged = JSON.stringify(cartItems) !== JSON.stringify(prevCartItemsRef.current);
      
      if (itemsChanged) {
        // Update server with current cart - use a timeout to ensure state is stable
        setTimeout(() => {
          dispatch(syncCartWithServer({ userId: user.uid, items: [...cartItems] }))
            .unwrap()
            .catch(error => {
              // Only log errors in production
              if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to sync cart to Firestore:', error);
              }
            });
        }, 100);
      }
    }
    
    // Always update previous cart items reference with a deep copy
    prevCartItemsRef.current = JSON.parse(JSON.stringify(cartItems));
  }, [dispatch, cartItems, isAuthenticated, user]);

  return {
    // The hook doesn't need to return anything as it handles syncing automatically
    // But we could expose additional functionality if needed
  };
};
