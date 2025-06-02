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

  // Calculate order total
  const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

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



  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-light/10 to-white py-20 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        <p className="mt-4 text-primary-dark font-medium">Loading...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-light/10 to-white py-20 px-4 flex flex-col items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-primary/10 max-w-md">
          <h2 className="text-2xl font-bold text-primary-dark mb-4 font-heading">Your cart is empty</h2>
          <p className="text-primary-dark/80 mb-6">Please add some products to your cart before checkout.</p>
          <a href="/" className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-medium transition-all duration-300 inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/10 to-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-dark mb-10 text-center font-heading">Checkout</h1>

        {/* Checkout Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step === 'address' ? 'bg-secondary text-white' : 'bg-primary-light/20 text-primary-dark'}`}>
              1
            </div>
            <div className={`text-sm ml-2 ${step === 'address' ? 'text-secondary font-semibold' : 'text-primary-dark'}`}>Shipping Address</div>
          </div>
          <div className="mx-4 border-t border-primary/20 w-20 mt-5"></div>
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step === 'payment' ? 'bg-secondary text-white' : 'bg-primary-light/20 text-primary-dark'}`}>
              2
            </div>
            <div className={`text-sm ml-2 ${step === 'payment' ? 'text-secondary font-semibold' : 'text-primary-dark'}`}>Payment</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address or Payment */}
          <div className="lg:col-span-2">
            {step === 'address' ? (
              <div className="bg-white border border-primary/10 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-primary-dark mb-6 font-heading">Shipping Address</h2>
                
                {!isAddingNewAddress && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {/* Address Selection */}
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div 
                          key={address.id} 
                          className={`border ${selectedAddress?.id === address.id ? 'border-secondary bg-secondary/5' : 'border-primary/10'} rounded-lg p-4 cursor-pointer hover:border-secondary transition-all duration-200`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-primary-dark">{address.fullName}</p>
                              <p className="text-primary-dark/80 mt-1">{address.phoneNumber}</p>
                              <p className="text-primary-dark/80 mt-2">{address.addressLine1}</p>
                              {address.addressLine2 && <p className="text-primary-dark/80">{address.addressLine2}</p>}
                              <p className="text-primary-dark/80">{address.city}, {address.state}, {address.postalCode}</p>
                              <p className="text-primary-dark/80">{address.country}</p>
                            </div>
                            {address.isDefault && (
                              <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full">
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
                      className="text-secondary hover:text-secondary-dark font-medium flex items-center gap-1 mt-4 bg-secondary/5 hover:bg-secondary/10 px-3 py-2 rounded-lg transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
                          className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gray-400 cursor-not-allowed transition-all duration-300 shadow-md"
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
                      className="text-primary-dark hover:text-primary font-medium bg-primary-light/10 hover:bg-primary-light/20 px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-primary/10 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-primary-dark mb-6 font-heading">Payment</h2>
                {order ? (
                  <PayUForm 
                    order={order} 
                    returnUrl={`${window.location.origin}/checkout/payment-result`} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                    <p className="mt-4 text-primary-dark/80 font-medium">Preparing your order...</p>
                  </div>
                )}
                
                {paymentError && (
                  <div className="mt-4 p-3 bg-red-100/50 text-secondary border border-secondary/20 rounded-lg">
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
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
