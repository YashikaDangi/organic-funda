'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  createUserOrder,
  fetchUserOrders,
  fetchOrderById,
  updateOrderPaymentDetails,
  updateOrderStatusThunk,
  selectOrders,
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError
} from '@/redux/slices/orderSlice';
import { Product } from '@/redux/slices/cartSlice';
import { Address } from '@/models/Address';
import { Order, OrderStatus, PaymentDetails, PaymentMethod } from '@/models/Order';

export const useOrder = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const currentOrder = useAppSelector(selectCurrentOrder);
  const loading = useAppSelector(selectOrderLoading);
  const error = useAppSelector(selectOrderError);

  const createOrder = async (
    userId: string,
    items: Product[],
    shippingAddress: Address,
    billingAddress?: Address,
    paymentMethod: PaymentMethod = PaymentMethod.PAYU
  ) => {
    return await dispatch(createUserOrder({
      userId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod
    })).unwrap();
  };

  const getOrders = async (userId: string) => {
    return await dispatch(fetchUserOrders(userId)).unwrap();
  };

  const getOrderById = async (orderId: string) => {
    return await dispatch(fetchOrderById(orderId)).unwrap();
  };

  const updatePaymentDetails = async (orderId: string, paymentDetails: Partial<PaymentDetails>) => {
    return await dispatch(updateOrderPaymentDetails({ orderId, paymentDetails })).unwrap();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    return await dispatch(updateOrderStatusThunk({ orderId, status })).unwrap();
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    createOrder,
    getOrders,
    getOrderById,
    updatePaymentDetails,
    updateOrderStatus
  };
};
