'use client';

import React, { ReactNode } from 'react';
import { useSyncCartWithLocalStorage } from '@/hooks/useSyncCartWithLocalStorage';
import { useServerCart } from '@/hooks/useServerCart';

interface CartSyncProviderProps {
  children: ReactNode;
}

// This component is responsible for syncing the cart with localStorage and Firestore
export default function CartSyncProvider({ children }: CartSyncProviderProps) {
  // Use hooks to sync cart with localStorage and Firestore
  useSyncCartWithLocalStorage();
  useServerCart(); // Add Firestore sync with real-time updates
  
  return <>{children}</>;
}
