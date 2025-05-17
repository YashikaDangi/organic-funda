'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useReduxAuth } from '@/hooks/useAuth';
import { useCart as useReduxCart } from '@/hooks/useCart';
import { Product } from '@/redux/slices/cartSlice';

interface AuthContextType {
  user: any;
  cart: Product[];
  login: () => void;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Legacy hook for backward compatibility
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider that uses Redux under the hood
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use our new Redux hooks
  const { user, login, logout } = useReduxAuth();
  const { cart, addToCart, removeFromCart, updateQuantity } = useReduxCart();
  
  return (
    <AuthContext.Provider
      value={{ user, cart, login, logout, addToCart, removeFromCart, updateQuantity }}
    >
      {children}
    </AuthContext.Provider>
  );
};
