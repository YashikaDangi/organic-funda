'use client';

import { Order, PaymentStatus } from '@/models/Order';
import { logger } from '@/utils/logger';
import { createPayUPaymentRequest, verifyPayUPaymentResponse } from './paymentService';
import { updateOrderStatus, updatePaymentDetails } from './orderService';

/**
 * PayU Integration Service
 * Handles all PayU payment gateway operations
 */
export const payuIntegrationService = {
  /**
   * Initiate a payment with PayU
   * @param order Order to process payment for
   * @param returnUrl Base URL for success/failure redirects
   * @returns Payment data for form submission
   */
  initiatePayment: async (order: Order, returnUrl: string) => {
    try {
      logger.payment.info('Initiating PayU payment', { orderId: order.id, orderNumber: order.orderNumber });
      
      // Create payment request for PayU
      const paymentRequest = createPayUPaymentRequest(order, returnUrl);
      
      // Update order status to payment pending
      await updateOrderStatus(order.id!, 'PAYMENT_PENDING');
      
      return {
        success: true,
        paymentRequest,
        payuUrl: process.env.NEXT_PUBLIC_PAYU_URL,
        orderId: order.id
      };
    } catch (error: any) {
      logger.payment.error('Failed to initiate PayU payment', { error: error.message, orderId: order.id });
      throw new Error(`Failed to initiate payment: ${error.message}`);
    }
  },
  
  /**
   * Process payment response from PayU
   * @param payuResponse Response data from PayU
   * @returns Processed payment result
   */
  processPaymentResponse: async (payuResponse: any) => {
    try {
      logger.payment.info('Processing PayU payment response', { payuResponse });
      
      // Verify the payment response
      const isValid = verifyPayUPaymentResponse(payuResponse);
      
      if (!isValid) {
        logger.payment.error('Invalid PayU response hash', { payuResponse });
        throw new Error('Invalid payment signature');
      }
      
      // Extract order ID from udf1
      const orderId = payuResponse.udf1;
      
      // Extract payment status
      const status = payuResponse.status;
      const isSuccess = status === 'success';
      
      // Update payment details
      await updatePaymentDetails(orderId, {
        paymentId: payuResponse.paymentId,
        transactionId: payuResponse.mihpayid,
        paymentStatus: isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        paymentDate: new Date().toISOString(),
        payuResponse
      });
      
      return {
        success: true,
        orderId,
        isSuccess,
        transactionId: payuResponse.mihpayid,
        paymentId: payuResponse.paymentId,
        amount: parseFloat(payuResponse.amount),
        status,
        mode: payuResponse.mode
      };
    } catch (error: any) {
      logger.payment.error('Failed to process PayU payment response', { error: error.message });
      throw new Error(`Failed to process payment response: ${error.message}`);
    }
  },
  
  /**
   * Check payment status
   * @param orderId Order ID to check payment status for
   * @returns Payment status information
   */
  checkPaymentStatus: async (orderId: string) => {
    try {
      // This would typically involve calling PayU's API to check payment status
      // For now, we'll just return the status from our database
      const response = await fetch(`/api/payment/payu/status?orderId=${orderId}`);
      const data = await response.json();
      
      return data;
    } catch (error: any) {
      logger.payment.error('Failed to check payment status', { error: error.message, orderId });
      throw new Error(`Failed to check payment status: ${error.message}`);
    }
  }
};
