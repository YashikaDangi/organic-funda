'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaTimesCircle, FaShoppingCart, FaHome, FaExclamationTriangle } from 'react-icons/fa';
import { logger } from '@/utils/logger';

const PaymentFailureHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract parameters from the PayU callback
    const orderId = searchParams.get('orderId');
    const txnid = searchParams.get('txnid');
    const error_Message = searchParams.get('error_Message');
    const error_Code = searchParams.get('error_Code');
    const status = searchParams.get('status');
    
    if (!orderId) {
      setIsProcessing(false);
      setError('Order ID not found');
      return;
    }
    
    // Log the payment failure callback
    logger.payment.warn('Payment failure callback received', {
      orderId,
      txnid,
      error_Message,
      error_Code,
      status
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
            paymentStatus: 'FAILED',
            failureReason: error_Message || 'Payment failed',
            paymentDetails: Object.fromEntries(searchParams.entries())
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update payment status');
        }
        
        // Navigate to the failure page
        window.location.href = `/checkout/failure?orderId=${orderId}&txnid=${txnid || ''}&error_Message=${encodeURIComponent(error_Message || 'Payment failed')}&error_Code=${error_Code || ''}`;
      } catch (error) {
        logger.payment.error('Error updating payment status for failed payment', {
          error: error instanceof Error ? error.message : String(error),
          orderId
        });
        
        setIsProcessing(false);
        setError('Failed to update payment status. Please try again.');
      }
    };
    
    updatePaymentStatus();
  }, [searchParams]);
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-[#4B423A] mb-2">Error Processing Payment</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Link href="/checkout" className="px-4 py-2 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
              <span className="flex items-center justify-center">
                <FaShoppingCart className="mr-2" /> Try Again
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
        <h1 className="text-xl font-semibold text-[#4B423A]">Processing your payment result...</h1>
        <p className="text-gray-600 mt-2">Please wait while we update your order status.</p>
      </div>
    </div>
  );
};

export default PaymentFailureHandler;
