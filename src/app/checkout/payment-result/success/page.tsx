'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaShoppingBag, FaHome, FaExclamationTriangle } from 'react-icons/fa';
import { useAppDispatch } from '@/redux/hooks';
import { clearCart } from '@/redux/slices/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

const PaymentSuccessHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract parameters from the PayU callback
    const orderId = searchParams.get('orderId');
    const txnid = searchParams.get('txnid');
    const mihpayid = searchParams.get('mihpayid');
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    
    if (!orderId) {
      setIsProcessing(false);
      setError('Order ID not found');
      return;
    }
    
    // Clear the cart after successful payment
    if (user?.uid) {
      dispatch(clearCart());
    }
    
    // Log the payment success callback
    logger.payment.info('Payment success callback received', {
      orderId,
      txnid,
      mihpayid,
      status,
      amount
    });
    
    // Update payment status in the database
    const updatePaymentStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentStatus: 'COMPLETED',
            transactionId: mihpayid || txnid,
            paymentDetails: Object.fromEntries(searchParams.entries())
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update payment status');
        }
        
        // Navigate to the success page using window.location for full page navigation
        // This avoids the router.push issues with POST requests
        window.location.href = `/checkout/success?orderId=${orderId}&txnid=${txnid || ''}&amount=${amount || ''}&status=success`;
      } catch (error) {
        logger.payment.error('Error updating payment status', {
          error: error instanceof Error ? error.message : String(error),
          orderId
        });
        
        setIsProcessing(false);
        setError('Failed to update payment status. Please contact customer support.');
      }
    };
    
    updatePaymentStatus();
  }, [searchParams, dispatch, user?.uid]);
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-[#4B423A] mb-2">Payment Processing Issue</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Link href="/orders" className="px-4 py-2 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
              <span className="flex items-center justify-center">
                <FaShoppingBag className="mr-2" /> View Orders
              </span>
            </Link>
            <Link href="/" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <span className="flex items-center justify-center">
                <FaHome className="mr-2" /> Go Home
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113] mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-[#4B423A]">Processing your payment...</h1>
        <p className="text-gray-600 mt-2">Please wait while we confirm your payment.</p>
      </div>
    </div>
  );
};

export default PaymentSuccessHandler;
