'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePayment } from '@/hooks/usePayment';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/models/Order';
import { logger } from '@/utils/logger';
import { trackEvent } from '@/utils/analytics';
import Link from 'next/link';

interface PaymentResult {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  bankReference?: string;
  cardInfo?: string;
  errorMessage?: string;
}

const PaymentResultPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { processPaymentResult, loading, error } = usePayment();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkPaymentStatus = async () => {
      try {
        // First check if we have an order ID in the URL parameters (from PayU redirect)
        let orderId = searchParams.get('udf1');

        // If not, check session storage (from our own app)
        if (!orderId) {
          orderId = sessionStorage.getItem('currentOrderId');
        }

        if (!orderId) {
          logger.payment.error('No order ID found for payment result check');
          return;
        }

        // Process the payment result
        const result = await processPaymentResult(orderId);
        if (result) {
          setPaymentResult(result);
        }
      } catch (err) {
        logger.payment.error('Error checking payment status', { error: err });
      }
    };

    checkPaymentStatus();
  }, [isClient, processPaymentResult, searchParams]);

  // Render loading state
  if (!isClient || loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-[#0E1C4C] mb-2">Processing Payment</h1>
          <p className="text-[#4B423A]">Please wait while we verify your payment status...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-6">
            <h1 className="text-2xl font-bold text-red-700 mb-2">Payment Error</h1>
            <p className="text-red-600">{error}</p>
          </div>
          <Link href="/cart" className="inline-block py-2 px-6 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  // Render success or failure based on payment status
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {paymentResult ? (
          <>
            {paymentResult.paymentStatus === PaymentStatus.COMPLETED ? (
              <div className="text-center">
                <div className="bg-green-100 p-6 rounded-lg mb-6">
                  <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h1 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h1>
                  <p className="text-green-600">Your order has been placed successfully.</p>
                </div>
                
                <div className="text-left mb-8 border p-4 rounded-lg border-[#CFC5BA]">
                  <h2 className="text-xl font-bold text-[#0E1C4C] mb-4 border-b pb-2 border-[#E6E1DC]">Order Details</h2>
                  <div className="grid grid-cols-2 gap-2 text-[#4B423A]">
                    <p className="font-medium">Order Number:</p>
                    <p>{paymentResult.orderNumber}</p>
                    
                    <p className="font-medium">Amount:</p>
                    <p>{paymentResult.currency} {paymentResult.amount.toFixed(2)}</p>
                    
                    <p className="font-medium">Transaction ID:</p>
                    <p>{paymentResult.transactionId || 'N/A'}</p>
                    
                    <p className="font-medium">Payment Method:</p>
                    <p>{paymentResult.paymentMethod === PaymentMethod.PAYU ? 'PayU' : paymentResult.paymentMethod || 'Online'}</p>
                    
                    {paymentResult.paymentDate && (
                      <>
                        <p className="font-medium">Payment Date:</p>
                        <p>{new Date(paymentResult.paymentDate).toLocaleString()}</p>
                      </>
                    )}
                    
                    {paymentResult.cardInfo && (
                      <>
                        <p className="font-medium">Card:</p>
                        <p>{paymentResult.cardInfo}</p>
                      </>
                    )}
                    
                    {paymentResult.bankReference && (
                      <>
                        <p className="font-medium">Bank Reference:</p>
                        <p>{paymentResult.bankReference}</p>
                      </>
                    )}
                    
                    <p className="font-medium">Status:</p>
                    <p className="text-green-600 font-medium">Paid</p>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Link href="/account/orders" className="py-2 px-6 bg-[#0E1C4C] text-white rounded-md hover:bg-[#1A2C5C] transition-colors">
                    View Orders
                  </Link>
                  <Link href="/products" className="py-2 px-6 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-red-100 p-6 rounded-lg mb-6">
                  <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <h1 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h1>
                  <p className="text-red-600">Your payment could not be processed.</p>
                </div>
                
                <div className="text-left mb-8 border p-4 rounded-lg border-[#CFC5BA]">
                  <h2 className="text-xl font-bold text-[#0E1C4C] mb-4 border-b pb-2 border-[#E6E1DC]">Order Details</h2>
                  <div className="grid grid-cols-2 gap-2 text-[#4B423A]">
                    <p className="font-medium">Order Number:</p>
                    <p>{paymentResult.orderNumber}</p>
                    
                    <p className="font-medium">Amount:</p>
                    <p>{paymentResult.currency} {paymentResult.amount.toFixed(2)}</p>
                    
                    <p className="font-medium">Payment Method:</p>
                    <p>{paymentResult.paymentMethod === PaymentMethod.PAYU ? 'PayU' : paymentResult.paymentMethod || 'Online'}</p>
                    
                    {paymentResult.transactionId && (
                      <>
                        <p className="font-medium">Transaction ID:</p>
                        <p>{paymentResult.transactionId}</p>
                      </>
                    )}
                    
                    {paymentResult.errorMessage && (
                      <>
                        <p className="font-medium">Error:</p>
                        <p className="text-red-600">{paymentResult.errorMessage}</p>
                      </>
                    )}
                    
                    <p className="font-medium">Status:</p>
                    <p className="text-red-600 font-medium">Failed</p>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Link href="/cart" className="py-2 px-6 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
                    Return to Cart
                  </Link>
                  <Link href="/contact" className="py-2 px-6 bg-[#0E1C4C] text-white rounded-md hover:bg-[#1A2C5C] transition-colors">
                    Contact Support
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="bg-yellow-100 p-6 rounded-lg mb-6">
              <svg className="w-16 h-16 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h1 className="text-2xl font-bold text-yellow-700 mb-2">Payment Status Unknown</h1>
              <p className="text-yellow-600">We couldn't determine the status of your payment.</p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Link href="/cart" className="py-2 px-6 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
                Return to Cart
              </Link>
              <Link href="/contact" className="py-2 px-6 bg-[#0E1C4C] text-white rounded-md hover:bg-[#1A2C5C] transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
