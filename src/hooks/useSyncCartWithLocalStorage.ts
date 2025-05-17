'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectCartItems, addToCart, Product } from '@/redux/slices/cartSlice';
import { useAuth } from './useAuth';

// This hook synchronizes the Redux cart state with localStorage
// It prioritizes server data when the user is logged in
export const useSyncCartWithLocalStorage = () => {
  const cartItems = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const initialLoadDoneRef = useRef(false);

  // Load cart from localStorage on initial render - only if not authenticated
  useEffect(() => {
    // Skip loading from localStorage if user is authenticated (will use server data instead)
    // Only load from localStorage if cart is empty and we haven't loaded yet
    if (!isAuthenticated && cartItems.length === 0 && !initialLoadDoneRef.current) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart) as Product[];
          parsedCart.forEach(item => {
            dispatch(addToCart(item));
          });
          initialLoadDoneRef.current = true;
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, [dispatch, isAuthenticated, cartItems.length]);

  // Save cart to localStorage whenever it changes
  // Always keep a local copy even when authenticated for offline support
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  return null; // This hook doesn't return anything, it just performs side effects
};
