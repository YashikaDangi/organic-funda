'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useAddress } from '@/hooks/useAddress';
import { useOrder } from '@/hooks/useOrder';
import { usePayment } from '@/hooks/usePayment';
import AddressForm from '@/components/checkout/AddressForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import PayUForm from '@/components/checkout/PayUForm';
import PaymentButton from '@/components/checkout/PaymentButton';
import { Address, AddressFormData } from '@/models/Address';
import { Order, OrderStatus, PaymentMethod } from '@/models/Order';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, totalAmount, clearCart } = useCart();
  const { addresses, defaultAddress, loading: addressLoading, addAddress } = useAddress(user?.uid);
  const { createOrder, currentOrder, loading: orderLoading } = useOrder();
  const { initiatePayment, loading: paymentLoading, error: paymentError } = usePayment();
  
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side only rendering to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/login?redirect=checkout');
    }
  }, [isClient, isAuthenticated, router]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (isClient && cart.length === 0) {
      router.push('/cart');
    }
  }, [isClient, cart, router]);

  // Set default address as selected address
  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    } else if (addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    }
  }, [defaultAddress, addresses]);

  // Calculate order totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping over u20b9500
  const discount = 0; // No discount by default
  const total = subtotal + tax + shippingCost - discount;

  const handleAddressSubmit = async (addressData: AddressFormData) => {
    if (!user?.uid) return;
    
    try {
      const newAddress = await addAddress(addressData);
      setSelectedAddress(newAddress);
      setIsAddingNewAddress(false);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleProceedToPayment = async () => {
    if (!user?.uid || !selectedAddress) return;
    
    try {
      // Create the order
      const newOrder = await createOrder(
        user.uid,
        cart,
        selectedAddress,
        undefined, // Use same address for billing
        PaymentMethod.PAYU
      );
      
      setOrder(newOrder);
      setStep('payment');
      
      // Initiate payment using our new payment service
      const returnUrl = `${window.location.origin}/checkout/payment-result`;
      const paymentData = await initiatePayment(selectedAddress, undefined);
      
      if (paymentData) {
        // Payment initiated successfully, the form will be auto-submitted
        console.log('Payment initiated successfully', paymentData);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
        <p className="mt-4 text-[#4B423A]">Loading...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
        <p className="text-[#4B423A] text-lg">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0E1C4C] mb-10 text-center">Checkout</h1>

        {/* Checkout Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step === 'address' ? 'bg-[#7B1113] text-white' : 'bg-[#CFC5BA] text-[#4B423A]'}`}>
              1
            </div>
            <div className={`text-sm ml-2 ${step === 'address' ? 'text-[#7B1113] font-semibold' : 'text-[#4B423A]'}`}>Shipping Address</div>
          </div>
          <div className="mx-4 border-t border-[#CFC5BA] w-20 mt-5"></div>
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step === 'payment' ? 'bg-[#7B1113] text-white' : 'bg-[#CFC5BA] text-[#4B423A]'}`}>
              2
            </div>
            <div className={`text-sm ml-2 ${step === 'payment' ? 'text-[#7B1113] font-semibold' : 'text-[#4B423A]'}`}>Payment</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address or Payment */}
          <div className="lg:col-span-2">
            {step === 'address' ? (
              <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#0E1C4C] mb-6">Shipping Address</h2>
                
                {!isAddingNewAddress && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {/* Address Selection */}
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div 
                          key={address.id} 
                          className={`border ${selectedAddress?.id === address.id ? 'border-[#7B1113]' : 'border-[#CFC5BA]'} rounded-lg p-4 cursor-pointer hover:border-[#7B1113] transition-colors`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-[#0E1C4C]">{address.fullName}</p>
                              <p className="text-[#4B423A] mt-1">{address.phoneNumber}</p>
                              <p className="text-[#4B423A] mt-2">{address.addressLine1}</p>
                              {address.addressLine2 && <p className="text-[#4B423A]">{address.addressLine2}</p>}
                              <p className="text-[#4B423A]">{address.city}, {address.state}, {address.postalCode}</p>
                              <p className="text-[#4B423A]">{address.country}</p>
                            </div>
                            {address.isDefault && (
                              <span className="bg-[#E6E1DC] text-[#4B423A] text-xs px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add New Address Button */}
                    <button
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-[#7B1113] hover:text-[#921518] font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Add New Address
                    </button>
                    
                    {/* Continue Button */}
                    <div className="mt-6">
                      {selectedAddress ? (
                        <PaymentButton
                          shippingAddress={selectedAddress}
                          isDisabled={orderLoading}
                        />
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gray-400 cursor-not-allowed transition-colors"
                        >
                          Select an Address
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <AddressForm 
                    onSubmit={handleAddressSubmit} 
                    loading={addressLoading}
                    buttonText={addresses.length === 0 ? 'Save Address & Continue' : 'Save Address'}
                  />
                )}
                
                {isAddingNewAddress && addresses.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setIsAddingNewAddress(false)}
                      className="text-[#4B423A] hover:text-[#0E1C4C] font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6">
                {order ? (
                  <PayUForm 
                    order={order} 
                    returnUrl={`${window.location.origin}/checkout/payment-result`} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
                    <p className="mt-4 text-[#4B423A]">Preparing your order...</p>
                  </div>
                )}
                
                {paymentError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    <p className="font-medium">Payment Error:</p>
                    <p>{paymentError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary 
              items={cart}
              subtotal={subtotal}
              tax={tax}
              shippingCost={shippingCost}
              discount={discount}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
