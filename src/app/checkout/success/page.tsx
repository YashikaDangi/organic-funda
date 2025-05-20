'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';
import { useAppDispatch } from '@/redux/hooks';
import { clearCart } from '@/redux/slices/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

const CheckoutSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const txnId = searchParams.get('txnid');
  const amount = searchParams.get('amount');
  const status = searchParams.get('status');
  
  useEffect(() => {
    // Clear the cart after successful payment
    if (user?.uid && status === 'success') {
      dispatch(clearCart());
    }
    
    // Fetch order details if orderId is available
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        setError('Order ID not found');
        return;
      }
      
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrderDetails(data.order);
        
        // Log the successful payment
        logger.payment.info('Payment successful', {
          orderId,
          txnId,
          amount,
          status
        });
      } catch (error: any) {
        setError(error.message);
        logger.payment.error('Error fetching order details', {
          error: error.message,
          orderId
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, txnId, amount, status, dispatch, user?.uid]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#7B1113] mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
            <FaHome className="mr-2" /> Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-[#7B1113] text-white text-center">
          <FaCheckCircle className="mx-auto text-5xl mb-4" />
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="mt-2">Your order has been placed successfully.</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#4B423A] mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Order Number:</p>
                <p className="font-medium">{orderDetails?.orderNumber || txnId}</p>
              </div>
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status:</p>
                <p className="font-medium text-green-600">Paid</p>
              </div>
              <div>
                <p className="text-gray-600">Amount:</p>
                <p className="font-medium">₹{amount || orderDetails?.totalAmount}</p>
              </div>
            </div>
          </div>
          
          {orderDetails?.items && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#4B423A] mb-4">Items Purchased</h2>
              <div className="space-y-4">
                {orderDetails.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center border-b pb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <FaShoppingBag className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#4B423A]">{item.name}</h3>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price}</p>
                      <p className="text-gray-600 text-sm">₹{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/orders" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
              <FaShoppingBag className="mr-2" /> View My Orders
            </Link>
            <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-[#7B1113] text-[#7B1113] rounded-md hover:bg-gray-50 transition-colors">
              <FaHome className="mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
