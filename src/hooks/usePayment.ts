'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Order } from '@/models/Order';
import { Address } from '@/models/Address';
import { logger } from '@/utils/logger';
import { trackEvent } from '@/utils/analytics';

/**
 * Custom hook for handling payments
 */
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  /**
   * Initiate a payment
   * @param shippingAddress Shipping address
   * @param billingAddress Optional billing address
   */
  const initiatePayment = useCallback(async (
    shippingAddress: Address,
    billingAddress?: Address
  ) => {
    if (!user || !user.uid) {
      setError('You must be logged in to make a payment');
      return null;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return null;
    }

    // Track checkout start event
    trackEvent('CHECKOUT_START', {
      userId: user.uid,
      itemCount: cart.length,
      cartTotal: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    });

    setLoading(true);
    setError(null);

    try {
      // Get the base URL for success/failure redirects
      const returnUrl = `${window.location.origin}/checkout/payment-result`;

      // Call the API to initiate payment
      const response = await fetch('/api/payment/payu/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          items: cart,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          returnUrl
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      logger.payment.info('Payment initiated successfully', { orderId: data.data.order.id });
      
      // Track payment initiated event
      trackEvent('PAYMENT_INITIATED', {
        orderId: data.data.order.id,
        orderNumber: data.data.order.orderNumber,
        amount: data.data.order.total,
        paymentMethod: data.data.order.paymentDetails.paymentMethod
      });
      
      // Store order ID in session storage for retrieval after payment
      sessionStorage.setItem('currentOrderId', data.data.order.id);
      
      return data.data;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while initiating payment';
      const errorDetails = {
        message: errorMessage,
        stack: err.stack,
        name: err.name,
        code: err.code
      };
      logger.payment.error('Error initiating payment', errorDetails);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, cart]);

  /**
   * Process payment result
   * @param orderId Order ID to check
   */
  const processPaymentResult = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);

    // Log the order ID being checked
    logger.payment.info('Checking payment result for order', { orderId });

    try {
      // Call the API to check payment status
      const response = await fetch(`/api/payment/payu/status?orderId=${orderId}`);
      const data = await response.json();
      
      // Log the API response for debugging
      logger.payment.info('Payment status API response', { 
        success: data.success, 
        message: data.message,
        orderId
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to check payment status');
      }

      // If payment was successful, clear the cart
      if (data.data.paymentStatus === 'COMPLETED') {
        clearCart();
        logger.payment.info('Payment completed successfully', { orderId });
        
        // Track successful payment completion
        trackEvent('PAYMENT_SUCCESS', {
          orderId,
          transactionId: data.data.transactionId,
          amount: data.data.amount,
          paymentMethod: data.data.paymentMethod
        });
      } else if (data.data.paymentStatus === 'FAILED') {
        // Track payment failure
        trackEvent('PAYMENT_FAILURE', {
          orderId,
          errorMessage: data.data.errorMessage || 'Payment failed',
          paymentMethod: data.data.paymentMethod
        });
      }

      return data.data;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while processing payment result';
      logger.payment.error('Error processing payment result', { error: errorMessage, orderId });
      
      // Track payment processing error
      trackEvent('PAYMENT_PROCESSING_ERROR', {
        orderId,
        error: errorMessage
      });
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearCart]);

  return {
    loading,
    error,
    initiatePayment,
    processPaymentResult
  };
};
