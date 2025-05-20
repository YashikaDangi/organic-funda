'use client';

import { Address, AddressFormData } from '@/models/Address';
import { logger } from '@/utils/logger';

// Add a new address
export const addAddress = async (userId: string, addressData: AddressFormData): Promise<Address> => {
  if (!userId) {
    throw new Error('User ID is required to add an address');
  }
  
  try {
    const response = await fetch('/api/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...addressData
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add address: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.address.error('Error adding address:', error);
    throw error;
  }
};

// Update an existing address
export const updateAddress = async (addressId: string, addressData: Partial<AddressFormData>): Promise<Address> => {
  if (!addressId) {
    throw new Error('Address ID is required to update an address');
  }
  
  try {
    const response = await fetch(`/api/address/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update address: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.address.error('Error updating address:', error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (addressId: string): Promise<boolean> => {
  if (!addressId) {
    throw new Error('Address ID is required to delete an address');
  }
  
  try {
    const response = await fetch(`/api/address/${addressId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete address: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    logger.address.error('Error deleting address:', error);
    throw error;
  }
};

// Get all addresses for a user
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    const response = await fetch(`/api/address?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch addresses: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.address.error('Error fetching addresses:', error);
    return [];
  }
};

// Get a single address by ID
export const getAddressById = async (addressId: string): Promise<Address | null> => {
  if (!addressId) {
    return null;
  }
  
  try {
    const response = await fetch(`/api/address/${addressId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch address: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.address.error('Error fetching address:', error);
    return null;
  }
};

// Get the default address for a user
export const getDefaultAddress = async (userId: string): Promise<Address | null> => {
  if (!userId) {
    return null;
  }
  
  try {
    const response = await fetch(`/api/address/default?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch default address: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.address.error('Error fetching default address:', error);
    return null;
  }
};
