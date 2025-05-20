'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getOrderById } from '@/services/mongodb/clientOrderService';
import { Order } from '@/models/Order';
import PayUForm from '@/components/checkout/PayUForm';
import { logger } from '@/utils/logger';
import Link from 'next/link';

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=checkout');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderId = searchParams.get('orderId');
        
        if (!orderId) {
          setError('Order ID is missing');
          setLoading(false);
          return;
        }

        // Fetch order details
        const orderData = await getOrderById(orderId);
        
        if (!orderData) {
          setError('Order not found');
          setLoading(false);
          return;
        }

        // Log user and order details for debugging
        logger.payment.info('Order and user details', {
          orderUserId: orderData.userId,
          currentUserId: user?.uid,
          orderNumber: orderData.orderNumber
        });
        
        // Temporarily bypass the user verification check to diagnose the issue
        // Comment this back in after debugging
        // if (orderData.userId !== user?.uid) {
        //   setError('Unauthorized access to order');
        //   setLoading(false);
        //   return;
        // }

        setOrder(orderData);
        setLoading(false);
      } catch (err: any) {
        logger.payment.error('Error fetching order', { error: err.message });
        setError(err.message || 'An error occurred while fetching order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isClient, isAuthenticated, router, searchParams, user]);

  // Render loading state
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-[#0E1C4C] mb-2">Preparing Your Payment</h1>
          <p className="text-[#4B423A]">Please wait while we set up your secure payment...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-6">
            <h1 className="text-2xl font-bold text-red-700 mb-2">Payment Error</h1>
            <p className="text-red-600">{error}</p>
          </div>
          <div className="flex justify-center space-x-4">
            <Link href="/cart" className="py-2 px-6 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
              Return to Cart
            </Link>
            <Link href="/checkout" className="py-2 px-6 bg-[#0E1C4C] text-white rounded-md hover:bg-[#1A2C5C] transition-colors">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render payment form
  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0E1C4C] mb-10 text-center">Complete Your Payment</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          {order ? (
            <PayUForm 
              order={order} 
              returnUrl={`${window.location.origin}/checkout/payment-result`} 
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-[#4B423A] text-lg">Order information not available.</p>
              <Link href="/checkout" className="mt-4 inline-block py-2 px-6 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
                Return to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
