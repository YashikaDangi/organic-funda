'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectCartItems, addToCart, Product } from '@/redux/slices/cartSlice';

// This hook synchronizes the Redux cart state with localStorage
export const useSyncCartWithLocalStorage = () => {
  const cartItems = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart && cartItems.length === 0) {
      try {
        const parsedCart = JSON.parse(savedCart) as Product[];
        parsedCart.forEach(item => {
          dispatch(addToCart(item));
        });
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, [dispatch]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  return null; // This hook doesn't return anything, it just performs side effects
};
