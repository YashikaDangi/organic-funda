'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useOrder } from '@/hooks/useOrder';
import { processPayUPaymentResponse } from '@/services/paymentService';
import { OrderStatus, PaymentStatus } from '@/models/Order';

const PaymentStatusPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const { updatePaymentDetails, updateOrderStatus } = useOrder();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Client-side only rendering to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !isAuthenticated) return;

    const processPaymentResponse = async () => {
      try {
        // Get all search params and convert to an object
        const payuResponse: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          payuResponse[key] = value;
        });

        // Check if we have a payment response
        if (Object.keys(payuResponse).length === 0) {
          setMessage('No payment information received.');
          setLoading(false);
          return;
        }

        // Process the payment response
        const result = processPayUPaymentResponse(payuResponse);
        setOrderId(result.orderId);

        if (result.isSuccess) {
          // Update payment details in the order
          await updatePaymentDetails(result.orderId, {
            paymentId: result.paymentId,
            transactionId: result.transactionId,
            paymentStatus: PaymentStatus.COMPLETED,
            payuResponse: result.payuResponse
          });

          // Update order status
          await updateOrderStatus(result.orderId, OrderStatus.PAYMENT_COMPLETED);

          // Clear the cart after successful payment
          clearCart();

          setSuccess(true);
          setMessage('Payment successful! Your order has been placed.');
        } else {
          // Update payment details in the order
          await updatePaymentDetails(result.orderId, {
            paymentStatus: PaymentStatus.FAILED,
            payuResponse: result.payuResponse
          });

          // Update order status
          await updateOrderStatus(result.orderId, OrderStatus.PAYMENT_FAILED);

          setSuccess(false);
          setMessage('Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setSuccess(false);
        setMessage('An error occurred while processing your payment.');
      } finally {
        setLoading(false);
      }
    };

    processPaymentResponse();
  }, [isClient, isAuthenticated, searchParams, updatePaymentDetails, updateOrderStatus, clearCart]);

  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
        <p className="mt-4 text-[#4B423A]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center">
      <div className="max-w-md w-full bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
            <p className="mt-4 text-[#4B423A]">Processing your payment...</p>
          </div>
        ) : success ? (
          <>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#0E1C4C] mt-6">Order Successful!</h2>
            <p className="text-[#4B423A] mt-2">{message}</p>
            {orderId && (
              <p className="text-[#4B423A] mt-4">
                Order ID: <span className="font-medium">{orderId}</span>
              </p>
            )}
            <div className="mt-8 space-y-3">
              <Link href="/account/orders" className="block w-full py-3 px-4 bg-[#7B1113] text-white rounded-lg font-semibold hover:bg-[#921518] transition-colors">
                View Your Orders
              </Link>
              <Link href="/" className="block w-full py-3 px-4 bg-[#EFEAE6] text-[#4B423A] rounded-lg font-semibold hover:bg-[#E6E1DC] transition-colors">
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#0E1C4C] mt-6">Payment Failed</h2>
            <p className="text-[#4B423A] mt-2">{message}</p>
            <div className="mt-8 space-y-3">
              <Link href="/checkout" className="block w-full py-3 px-4 bg-[#7B1113] text-white rounded-lg font-semibold hover:bg-[#921518] transition-colors">
                Try Again
              </Link>
              <Link href="/cart" className="block w-full py-3 px-4 bg-[#EFEAE6] text-[#4B423A] rounded-lg font-semibold hover:bg-[#E6E1DC] transition-colors">
                Return to Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
