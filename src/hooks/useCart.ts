'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  addToCart as addToCartAction, 
  removeFromCart as removeFromCartAction, 
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  clearCartInServer,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  selectIsSyncing,
  selectLastSynced,
  selectCartError,
  Product
} from '@/redux/slices/cartSlice';
import { useAuth } from './useAuth';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectCartTotalItems);
  const totalAmount = useAppSelector(selectCartTotalAmount);
  const isSyncing = useAppSelector(selectIsSyncing);
  const lastSynced = useAppSelector(selectLastSynced);
  const error = useAppSelector(selectCartError);

  const addToCart = (product: Product) => {
    dispatch(addToCartAction(product));
  };

  const removeFromCart = (productId: string) => {
    dispatch(removeFromCartAction(productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch(updateQuantityAction({ id: productId, quantity }));
  };

  const { user } = useAuth();

  // Clear cart both locally and in Firestore
  const clearCart = () => {
    if (user?.uid) {
      // If user is authenticated, clear cart in both local state and Firestore
      console.log('Clearing cart for user:', user.uid);
      dispatch(clearCartInServer(user.uid));
    } else {
      // If not authenticated, just clear local cart
      console.log('Clearing local cart only (user not authenticated)');
      dispatch(clearCartAction());
    }
  };

  return {
    cart: cartItems,
    totalItems,
    totalAmount,
    isSyncing,
    lastSynced,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};
