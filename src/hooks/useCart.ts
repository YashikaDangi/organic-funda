'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  addToCart as addToCartAction, 
  removeFromCart as removeFromCartAction, 
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  Product
} from '@/redux/slices/cartSlice';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectCartTotalItems);
  const totalAmount = useAppSelector(selectCartTotalAmount);

  const addToCart = (product: Product) => {
    dispatch(addToCartAction(product));
  };

  const removeFromCart = (productId: string) => {
    dispatch(removeFromCartAction(productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch(updateQuantityAction({ id: productId, quantity }));
  };

  const clearCart = () => {
    dispatch(clearCartAction());
  };

  return {
    cart: cartItems,
    totalItems,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};
