'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Order } from '@/models/Order';
import { createPayUPaymentRequest } from '@/services/mongodb/serverPaymentService';
import { logger } from '@/utils/logger';

interface PayUFormProps {
  order: Order;
  returnUrl: string;
}

const PayUForm: React.FC<PayUFormProps> = ({ order, returnUrl }) => {
  const formRef = useRef<HTMLFormElement>(null);

  // Validate order data before creating payment request
  const [paymentRequest, paymentError] = React.useMemo(() => {
    try {
      // Validate required order fields
      if (!order || !order.id || !order.orderNumber || !order.shippingAddress) {
        logger.payment.error('Invalid order data', {
          orderId: order?.id,
          orderNumber: order?.orderNumber,
          hasShippingAddress: !!order?.shippingAddress
        });
        return [null, 'Missing required order information'];
      }
      
      // Create the payment request
      const request = createPayUPaymentRequest(order, returnUrl);
      return [request, null];
    } catch (error: any) {
      logger.payment.error('Error creating payment request', {
        error: error.message,
        orderId: order?.id,
        orderNumber: order?.orderNumber
      });
      return [null, error.message || 'Failed to create payment request'];
    }
  }, [order, returnUrl]);

  // State to track form submission errors
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Track form submission attempts to prevent multiple submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  
  // Submit the form when component mounts and we have a valid payment request
  useEffect(() => {
    // Only proceed if we have a valid payment request and not already submitting
    if (!paymentRequest || isSubmitting) {
      if (!paymentRequest) {
        logger.payment.error('Cannot submit payment form - invalid payment request');
      }
      return;
    }
    
    // Auto-submit the form when it's mounted
    if (formRef.current) {
      try {
        // Prevent multiple submissions
        setIsSubmitting(true);
        
        // Track submission attempts to implement exponential backoff
        setSubmissionAttempts(prev => prev + 1);
        
        // Calculate delay based on attempts (exponential backoff)
        const submissionDelay = Math.min(2000 * Math.pow(1.5, submissionAttempts - 1), 10000);
        
        logger.payment.info('Preparing to submit payment form to PayU', { 
          orderId: order.id,
          orderNumber: order.orderNumber,
          attempt: submissionAttempts,
          delay: submissionDelay
        });
        
        // Add event listener for form submission errors
        const handleSubmitError = (event: ErrorEvent) => {
          // Check if this is a rate limiting error
          const isRateLimitError = event.message.includes('429') || 
                                  event.message.includes('Too Many Requests');
          
          logger.payment.error('Form submission error', { 
            error: event.message, 
            isRateLimitError 
          });
          
          if (isRateLimitError) {
            setSubmissionError('Payment gateway is busy. Please wait a moment and try again.');
          } else {
            setSubmissionError('Payment gateway connection error. Please try again.');
          }
          
          // Allow resubmission after error
          setIsSubmitting(false);
        };
        
        window.addEventListener('error', handleSubmitError);
        
        // Delay with exponential backoff to avoid rate limiting
        setTimeout(() => {
          try {
            logger.payment.info('Submitting payment form to PayU', { 
              orderId: order.id,
              orderNumber: order.orderNumber,
              attempt: submissionAttempts
            });
            
            formRef.current?.submit();
          } catch (error: any) {
            logger.payment.error('Form submission failed', { error: error.message });
            setSubmissionError('Failed to connect to payment gateway: ' + error.message);
            setIsSubmitting(false);
          }
        }, submissionDelay);
        
        return () => {
          window.removeEventListener('error', handleSubmitError);
        };
      } catch (error: any) {
        logger.payment.error('Error in payment form submission', { error: error.message });
        setSubmissionError('Error preparing payment: ' + error.message);
        setIsSubmitting(false);
      }
    }
  }, [order.id, order.orderNumber, paymentRequest, isSubmitting, submissionAttempts]);

  // If there's a payment error or submission error, show error message
  if (paymentError || submissionError) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-6 text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-red-700 mb-2">Payment Error</h2>
            <p className="text-red-600">{paymentError || submissionError}</p>
          </div>
          <p className="text-[#4B423A] mt-4">
            {submissionError ? 
              'There was a problem connecting to the payment gateway. This could be due to network issues or gateway restrictions.' : 
              'There was a problem setting up your payment. Please try again or contact customer support.'}
          </p>
          {submissionError && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Troubleshooting Tips:</h3>
              <ul className="list-disc pl-5 text-left text-yellow-800">
                <li>Check your internet connection</li>
                <li>Ensure you're not using a VPN or proxy</li>
                <li>Try a different browser</li>
                <li>Contact your bank to ensure they allow online payments</li>
              </ul>
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link href="/checkout" className="mt-2 py-2 px-4 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
            Return to Checkout
          </Link>
        </div>
      </div>
    );
  }
  
  // If payment request is null (shouldn't happen if validation is working)
  if (!paymentRequest) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-6 text-center">
          <div className="bg-yellow-100 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-yellow-700 mb-2">Payment Setup Issue</h2>
            <p className="text-yellow-600">Unable to set up payment request. Please try again.</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link href="/checkout" className="mt-2 py-2 px-4 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors">
            Return to Checkout
          </Link>
        </div>
      </div>
    );
  }

  // Normal payment form rendering
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-[#0E1C4C] mb-2">Redirecting to Payment Gateway</h2>
        <p className="text-[#4B423A]">Please wait while we redirect you to the secure payment page...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B1113]"></div>
        </div>
      </div>

      {/* Hidden form for PayU integration */}
      <form
        ref={formRef}
        action="https://secure.payu.in/_payment"
        method="post"
        className="hidden"
        target="_self"
        onSubmit={(e) => {
          // Log the form submission for debugging
          logger.payment.info('Form submission event', { orderId: order.id });
        }}
      >
        {/* Required PayU parameters */}
        <input type="hidden" name="key" value={paymentRequest.key} />
        <input type="hidden" name="txnid" value={paymentRequest.txnid} />
        <input type="hidden" name="amount" value={paymentRequest.amount} />
        <input type="hidden" name="productinfo" value={paymentRequest.productinfo} />
        <input type="hidden" name="firstname" value={paymentRequest.firstname} />
        <input type="hidden" name="email" value={paymentRequest.email} />
        <input type="hidden" name="phone" value={paymentRequest.phone} />
        <input type="hidden" name="surl" value={paymentRequest.surl} />
        <input type="hidden" name="furl" value={paymentRequest.furl} />
        <input type="hidden" name="hash" value={paymentRequest.hash} />

        {/* Optional parameters */}
        {paymentRequest.udf1 && <input type="hidden" name="udf1" value={paymentRequest.udf1} />}
        {paymentRequest.address1 && <input type="hidden" name="address1" value={paymentRequest.address1} />}
        {paymentRequest.address2 && <input type="hidden" name="address2" value={paymentRequest.address2} />}
        {paymentRequest.city && <input type="hidden" name="city" value={paymentRequest.city} />}
        {paymentRequest.state && <input type="hidden" name="state" value={paymentRequest.state} />}
        {paymentRequest.country && <input type="hidden" name="country" value={paymentRequest.country} />}
        {paymentRequest.zipcode && <input type="hidden" name="zipcode" value={paymentRequest.zipcode} />}

        <button type="submit" className="hidden">Submit</button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-[#4B423A]">If you are not redirected automatically, please click the button below:</p>
        <button
          onClick={() => {
            if (!isSubmitting) {
              setIsSubmitting(true);
              setSubmissionAttempts(prev => prev + 1);
              
              // Add a small delay to prevent accidental double-clicks
              setTimeout(() => {
                try {
                  logger.payment.info('Manual payment form submission', { 
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    attempt: submissionAttempts + 1
                  });
                  formRef.current?.submit();
                } catch (error: any) {
                  logger.payment.error('Manual form submission failed', { error: error.message });
                  setSubmissionError('Failed to connect to payment gateway: ' + error.message);
                  setIsSubmitting(false);
                }
              }, 100);
            }
          }}
          disabled={isSubmitting}
          className={`mt-2 py-2 px-4 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#7B1113] hover:bg-[#921518]'} text-white rounded-md transition-colors`}
        >
          {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default PayUForm;
