'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchUserAddresses,
  fetchDefaultAddress,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  selectAddresses,
  selectDefaultAddress,
  selectAddressLoading,
  selectAddressError
} from '@/redux/slices/addressSlice';
import { AddressFormData } from '@/models/Address';

export const useAddress = (userId?: string) => {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddresses);
  const defaultAddress = useAppSelector(selectDefaultAddress);
  const loading = useAppSelector(selectAddressLoading);
  const error = useAppSelector(selectAddressError);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserAddresses(userId));
    }
  }, [userId, dispatch]);

  const addAddress = async (addressData: AddressFormData) => {
    if (!userId) {
      throw new Error('User must be logged in to add an address');
    }
    return await dispatch(addUserAddress({ userId, addressData })).unwrap();
  };

  const updateAddress = async (addressId: string, addressData: Partial<AddressFormData>) => {
    return await dispatch(updateUserAddress({ addressId, addressData })).unwrap();
  };

  const deleteAddress = async (addressId: string) => {
    return await dispatch(deleteUserAddress(addressId)).unwrap();
  };

  const loadDefaultAddress = async () => {
    if (userId) {
      return await dispatch(fetchDefaultAddress(userId)).unwrap();
    }
    return null;
  };

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    loadDefaultAddress
  };
};
