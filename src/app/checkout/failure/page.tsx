'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaTimesCircle, FaShoppingCart, FaHome, FaExclamationTriangle } from 'react-icons/fa';
import { logger } from '@/utils/logger';
import { headers } from 'next/headers';

const CheckoutFailurePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string>('Payment was not successful');
  const [paymentErrorCode, setPaymentErrorCode] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  // Get parameters from URL
  const orderId = searchParams.get('orderId');
  const txnId = searchParams.get('txnid');
  const errorMessage = searchParams.get('error_Message');
  const errorCode = searchParams.get('error_Code');
  
  useEffect(() => {
    // Set payment details from URL parameters
    if (errorMessage) setPaymentError(errorMessage);
    if (errorCode) setPaymentErrorCode(errorCode);
    if (txnId) setTransactionId(txnId);
    if (orderId) setPaymentOrderId(orderId);
    
    // Handle POST requests from PayU
    const handlePostData = async () => {
      try {
        // This is a client-side component, so we can't access the POST body directly
        // Instead, we'll redirect to our API route which can handle the POST request
        if (!orderId && !txnId && !errorMessage) {
          // If we don't have any parameters, this might be a direct POST from PayU
          // Redirect to our API route to handle it properly
          const currentUrl = window.location.href;
          const apiUrl = currentUrl.replace('/checkout/failure', '/api/checkout/failure');
          
          logger.payment.info('Redirecting POST request to API route', { from: currentUrl, to: apiUrl });
          
          // Use fetch to forward the request to our API route
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            // Our API will handle the payment and redirect back here with proper parameters
            // No need to do anything else
            logger.payment.info('Successfully redirected to API route');
          } else {
            logger.payment.error('Failed to redirect to API route', { status: response.status });
            setPaymentError('Failed to process payment response');
          }
        }
      } catch (error: any) {
        logger.payment.error('Error handling POST data', { error: error.message });
        setPaymentError('Error processing payment: ' + error.message);
      }
    };
    
    handlePostData();
    
    // Fetch order details if orderId is available
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          // If 404, don't treat as an error, just continue with empty order details
          if (response.status === 404) {
            logger.payment.warn('Order not found, but continuing', { orderId });
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        if (data.success && data.order) {
          setOrderDetails(data.order);
        }
        
        // Log the payment failure
        logger.payment.warn('Payment failed', {
          orderId,
          txnId,
          errorCode,
          errorMessage
        });
      } catch (error: any) {
        logger.payment.error('Error fetching order details for failed payment', {
          error: error.message || 'Unknown error',
          orderId
        });
        // Don't show error to user, just continue with empty order details
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, txnId, errorCode, errorMessage]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-red-600 text-white text-center">
          <FaTimesCircle className="mx-auto text-5xl mb-4" />
          <h1 className="text-2xl font-bold">Payment Failed</h1>
          <p className="mt-2">We couldn't process your payment.</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Payment Error</h3>
                <p className="text-red-700 mt-1">{errorMessage}</p>
                {errorCode && <p className="text-red-600 text-sm mt-1">Error Code: {errorCode}</p>}
              </div>
            </div>
          </div>
          
          {orderDetails && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#4B423A] mb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Order Number:</p>
                  <p className="font-medium">{orderDetails.orderNumber || txnId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date:</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Status:</p>
                  <p className="font-medium text-red-600">Failed</p>
                </div>
                <div>
                  <p className="text-gray-600">Amount:</p>
                  <p className="font-medium">₹{orderDetails.totalAmount}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#4B423A] mb-4">What happened?</h2>
            <p className="text-gray-600">
              Your payment was not successful. This could be due to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Insufficient funds in your account</li>
              <li>Card declined by your bank</li>
              <li>Incorrect payment details</li>
              <li>Temporary issue with the payment gateway</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#4B423A] mb-4">What can you do?</h2>
            <p className="text-gray-600">
              You can try the following:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Check your payment details and try again</li>
              <li>Use a different payment method</li>
              <li>Contact your bank to ensure there are no restrictions on your card</li>
              <li>Try again later if it's a temporary issue</li>
            </ul>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/checkout" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
              <FaShoppingCart className="mr-2" /> Try Again
            </Link>
            <Link href="/cart" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-[#7B1113] text-[#7B1113] rounded-md hover:bg-gray-50 transition-colors">
              <FaShoppingCart className="mr-2" /> Return to Cart
            </Link>
            <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <FaHome className="mr-2" /> Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailurePage;
