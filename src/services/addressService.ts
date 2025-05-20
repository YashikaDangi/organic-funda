'use client';

import { db } from '@/lib/firebase';
import { Address, AddressFormData } from '@/models/Address';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Helper function to handle Firestore errors
const handleFirestoreError = (error: any): void => {
  // Only log detailed errors in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    if (error.code === 'permission-denied') {
      logger.firestore.error('Permission denied. Check security rules and authentication state.');
    } else if (error.code === 'unavailable') {
      logger.firestore.warn('Firebase is currently unavailable. Will retry when connection is restored.');
    } else {
      logger.firestore.error('Operation failed', { code: error.code || 'unknown' });
    }
  }
};

// Retry mechanism for Firestore operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry permission errors - they won't resolve with retries
      if (error.code === 'permission-denied') {
        break;
      }
      
      // Wait before next retry with exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
};

// Add a new address
export const addAddress = async (userId: string, addressData: AddressFormData): Promise<Address> => {
  if (!userId) {
    throw new Error('User ID is required to add an address');
  }
  
  try {
    const addressId = uuidv4();
    const addressRef = doc(db, 'addresses', addressId);
    
    const address: Address = {
      id: addressId,
      userId,
      ...addressData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await retryOperation(async () => {
      await setDoc(addressRef, address);
      return true;
    });
    
    // If this is the default address, update any existing default addresses
    if (address.isDefault) {
      await updateDefaultAddress(userId, addressId);
    }
    
    return address;
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

// Update an existing address
export const updateAddress = async (addressId: string, addressData: Partial<AddressFormData>): Promise<Address> => {
  if (!addressId) {
    throw new Error('Address ID is required to update an address');
  }
  
  try {
    const addressRef = doc(db, 'addresses', addressId);
    
    // Get the current address data
    const addressDoc = await getDoc(addressRef);
    if (!addressDoc.exists()) {
      throw new Error('Address not found');
    }
    
    const currentAddress = addressDoc.data() as Address;
    const userId = currentAddress.userId;
    
    // Update the address
    const updatedAddress: Partial<Address> = {
      ...addressData,
      updatedAt: new Date().toISOString()
    };
    
    await retryOperation(async () => {
      await updateDoc(addressRef, updatedAddress);
      return true;
    });
    
    // If this is being set as the default address, update any existing default addresses
    if (addressData.isDefault) {
      await updateDefaultAddress(userId, addressId);
    }
    
    return { ...currentAddress, ...updatedAddress };
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (addressId: string): Promise<boolean> => {
  if (!addressId) {
    throw new Error('Address ID is required to delete an address');
  }
  
  try {
    const addressRef = doc(db, 'addresses', addressId);
    
    await retryOperation(async () => {
      await deleteDoc(addressRef);
      return true;
    });
    
    return true;
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

// Get all addresses for a user
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    return await retryOperation(async () => {
      const addressesQuery = query(collection(db, 'addresses'), where('userId', '==', userId));
      const addressesSnapshot = await getDocs(addressesQuery);
      
      const addresses: Address[] = [];
      addressesSnapshot.forEach((doc) => {
        addresses.push(doc.data() as Address);
      });
      
      return addresses;
    });
  } catch (error) {
    handleFirestoreError(error);
    return [];
  }
};

// Get a single address by ID
export const getAddressById = async (addressId: string): Promise<Address | null> => {
  if (!addressId) {
    return null;
  }
  
  try {
    return await retryOperation(async () => {
      const addressRef = doc(db, 'addresses', addressId);
      const addressDoc = await getDoc(addressRef);
      
      if (addressDoc.exists()) {
        return addressDoc.data() as Address;
      }
      
      return null;
    });
  } catch (error) {
    handleFirestoreError(error);
    return null;
  }
};

// Get the default address for a user
export const getDefaultAddress = async (userId: string): Promise<Address | null> => {
  if (!userId) {
    return null;
  }
  
  try {
    return await retryOperation(async () => {
      const addressesQuery = query(
        collection(db, 'addresses'), 
        where('userId', '==', userId),
        where('isDefault', '==', true)
      );
      
      const addressesSnapshot = await getDocs(addressesQuery);
      
      if (!addressesSnapshot.empty) {
        return addressesSnapshot.docs[0].data() as Address;
      }
      
      return null;
    });
  } catch (error) {
    handleFirestoreError(error);
    return null;
  }
};

// Helper function to update default address status
const updateDefaultAddress = async (userId: string, newDefaultAddressId: string): Promise<void> => {
  try {
    const addressesQuery = query(
      collection(db, 'addresses'),
      where('userId', '==', userId),
      where('isDefault', '==', true)
    );
    
    const addressesSnapshot = await getDocs(addressesQuery);
    
    // Update all other addresses to not be default
    const updatePromises = addressesSnapshot.docs
      .filter(doc => doc.id !== newDefaultAddressId)
      .map(doc => updateDoc(doc.ref, { isDefault: false, updatedAt: new Date().toISOString() }));
    
    await Promise.all(updatePromises);
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};
