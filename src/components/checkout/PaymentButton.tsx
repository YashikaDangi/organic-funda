'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePayment } from '@/hooks/usePayment';
import { useCart } from '@/hooks/useCart';
import { Address } from '@/models/Address';
import { logger } from '@/utils/logger';
import { trackEvent } from '@/utils/analytics';

interface PaymentButtonProps {
  shippingAddress: Address;
  billingAddress?: Address;
  isDisabled?: boolean;
  className?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  shippingAddress,
  billingAddress,
  isDisabled = false,
  className = '',
}) => {
  const router = useRouter();
  const { initiatePayment, loading, error } = usePayment();
  const { cart } = useCart();
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Calculate order summary
  const calculateOrderSummary = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = 0; // Assuming 5% tax
    const shipping = 0; // Flat shipping fee
    const total = subtotal + tax + shipping;
    
    return {
      subtotal,
      tax,
      shipping,
      total,
      itemCount: cart.reduce((count, item) => count + item.quantity, 0)
    };
  };

  // Show payment summary before proceeding
  const handleShowSummary = () => {
    if (isDisabled || loading) return;
    setLocalError(null);
    setShowSummary(true);
    
    // Track event
    trackEvent('CHECKOUT_START', {
      itemCount: cart.length,
      cartTotal: calculateOrderSummary().total
    });
  };
  
  // Handle actual payment initiation
  const handlePayment = async () => {
    if (isDisabled || loading) return;

    try {
      setLocalError(null);
      setProcessingPayment(true);
      logger.payment.info('Initiating payment process', { address: shippingAddress.id });
      
      // Initiate payment
      const paymentData = await initiatePayment(shippingAddress, billingAddress);
      
      if (paymentData && paymentData.order && paymentData.order.id) {
        logger.payment.info('Payment initiated successfully', { orderId: paymentData.order.id });
        
        // Redirect to payment page
        router.push(`/checkout/payment?orderId=${paymentData.order.id}`);
      } else {
        throw new Error('Invalid payment data returned from server');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while initiating payment';
      logger.payment.error('Error initiating payment', { 
        error: errorMessage,
        stack: err.stack,
        name: err.name
      });
      setLocalError(errorMessage);
      setProcessingPayment(false);
      setShowSummary(false);
    }
  };

  return (
    <div className="w-full">
      {/* Payment Button */}
      <button
        onClick={handleShowSummary}
        disabled={isDisabled || loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${isDisabled || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-secondary-dark'} transition-all duration-300 shadow-md hover:shadow-lg ${className}`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Proceed to Payment'
        )}
      </button>
      
      {/* Error Message */}
      {(error || localError) && (
        <div className="mt-2 p-3 bg-red-100/50 text-secondary border border-secondary/20 text-sm rounded-lg">
          {error || localError}
        </div>
      )}
      
      {/* Payment Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#0E1C4C] mb-4">Payment Summary</h2>
              
              {/* Order Summary */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-semibold text-lg mb-2 text-[#4B423A]">Order Details</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({calculateOrderSummary().itemCount}):</span>
                    <span className="font-medium text-black">₹{calculateOrderSummary().subtotal.toFixed(2)}</span>
                  </div>
                  
                  
                  <div className="flex justify-between pt-2 border-t border-gray-100 font-bold">
                    <span className='text-black'>Total:</span>
                    <span className="text-[#7B1113]">₹{calculateOrderSummary().total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-[#4B423A]">Shipping Address</h3>
                <div className="text-gray-600">
                  <p>{shippingAddress.fullName}</p>
                  <p>{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  <p>Phone: {shippingAddress.phoneNumber}</p>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-[#4B423A]">Payment Method</h3>
                <div className="flex items-center p-3 border border-gray-200 rounded-md">
                  <div className="bg-blue-100 p-2 rounded-md mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-black">PayU Payment Gateway</p>
                    <p className="text-sm text-gray-500">Secure online payment</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSummary(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="flex-1 py-2 px-4 bg-[#7B1113] text-white rounded-md hover:bg-[#921518] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processingPayment ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentButton;
