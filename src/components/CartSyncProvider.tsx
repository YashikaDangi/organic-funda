'use client';

import React, { ReactNode } from 'react';
import { useSyncCartWithLocalStorage } from '@/hooks/useSyncCartWithLocalStorage';

interface CartSyncProviderProps {
  children: ReactNode;
}

// This component is responsible for syncing the cart with localStorage
export default function CartSyncProvider({ children }: CartSyncProviderProps) {
  // Use the hook to sync cart with localStorage
  useSyncCartWithLocalStorage();
  
  return <>{children}</>;
}
