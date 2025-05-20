'use client';

import React, { ReactNode } from 'react';
import { useSyncCartWithLocalStorage } from '@/hooks/useSyncCartWithLocalStorage';
import { useMongoDBCart } from '@/hooks/useMongoDBCart';

interface CartSyncProviderProps {
  children: ReactNode;
}

// This component is responsible for syncing the cart with localStorage and MongoDB
export default function CartSyncProvider({ children }: CartSyncProviderProps) {
  // Use hooks to sync cart with localStorage and MongoDB
  useSyncCartWithLocalStorage();
  useMongoDBCart(); // Add MongoDB sync
  
  return <>{children}</>;
}
