"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useAddress } from "@/hooks/useAddress";
import { useOrder } from "@/hooks/useOrder";
import { usePayment } from "@/hooks/usePayment";
import AddressForm from "@/components/checkout/AddressForm";
import PayUForm from "@/components/checkout/PayUForm";
import PaymentButton from "@/components/checkout/PaymentButton";
import { Address, AddressFormData } from "@/models/Address";
import { Order } from "@/models/Order";

const CartPage: React.FC = () => {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, totalAmount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const { addresses, defaultAddress, loading: addressLoading, addAddress } = useAddress(user?.uid);
  const { createOrder, currentOrder, loading: orderLoading } = useOrder();
  const { initiatePayment, loading: paymentLoading, error: paymentError } = usePayment();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    } else if (addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    }
  }, [defaultAddress, addresses]);

  const formattedTotal = totalAmount.toFixed(2);

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

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-light/10 to-white py-20 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        <p className="mt-4 text-primary-dark font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 ">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 mt-20">
          <span className="text-secondary">Cart</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-600">Payment</span>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Shipping Form */}
            <div className="lg:col-span-8">
              <div className="space-y-8">
                {/* Shipping Address Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
                  {isAuthenticated ? (
                    <div className="bg-white rounded-xl border border-gray-200">
                      <div className="p-6">
                        {isAddingNewAddress ? (
                          <AddressForm onSubmit={handleAddressSubmit} />
                        ) : (
                          <>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {addresses.map((address) => (
                                <div
                                  key={address.id}
                                  className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                                    selectedAddress?.id === address.id
                                      ? 'border-2 border-secondary bg-secondary/5'
                                      : 'border border-gray-200 hover:border-secondary'
                                  }`}
                                  onClick={() => setSelectedAddress(address)}
                                >
                                  {address.isDefault && (
                                    <span className="absolute top-2 right-2 bg-accent/10 text-accent text-xs px-2 py-1 rounded-full">
                                      Default
                                    </span>
                                  )}
                                  <div className="mt-4">
                                    <p className="font-semibold text-gray-900">{address.fullName}</p>
                                    <p className="text-gray-600 text-sm mt-1">{address.phoneNumber}</p>
                                    <div className="mt-2 text-gray-600 text-sm space-y-1">
                                      <p>{address.addressLine1}</p>
                                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                                      <p>{address.city}, {address.state}, {address.postalCode}</p>
                                      <p>{address.country}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <button
                              onClick={() => setIsAddingNewAddress(true)}
                              className="mt-6 inline-flex items-center gap-2 text-secondary hover:text-secondary-dark font-medium px-4 py-2 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Add New Address
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white rounded-xl border border-gray-200">
                      <p className="text-gray-600 mb-4">Please sign in to add shipping address</p>
                      <Link
                        href="/login?redirect=cart"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                      >
                        Sign in
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Cart Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Cart</h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/mushroom1.jpg";
                          }}
                        />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="flex items-center mt-2 space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/>
                            </svg>
                          </button>
                          <span className="text-sm text-gray-600">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Code */}
                {/* <div className="mt-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                    <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                      Apply
                    </button>
                  </div>
                </div> */}

                {/* Order Summary */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>₹{formattedTotal}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t">
                    <span>Total</span>
                    <span>₹{(parseFloat(formattedTotal)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Section */}
                {isAuthenticated ? (
                  <div className="mt-6">
                    {order ? (
                      <PayUForm 
                        order={order} 
                        returnUrl={`${window.location.origin}/checkout/payment-result`} 
                      />
                    ) : (
                      <PaymentButton
                        shippingAddress={selectedAddress!}
                        isDisabled={!selectedAddress}
                        className="w-full bg-secondary hover:bg-secondary-dark text-white py-3 rounded-lg font-medium transition-colors"
                      />
                    )}
                    
                    {paymentError && (
                      <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                        <p className="font-medium">Payment Error:</p>
                        <p className="mt-1 text-sm">{paymentError}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6">
                    <Link
                      href="/login?redirect=cart"
                      className="block w-full bg-secondary hover:bg-secondary-dark text-white py-3 rounded-lg font-medium text-center transition-colors"
                    >
                      Sign in to Checkout
                    </Link>
                    <p className="mt-3 text-sm text-gray-500 text-center">
                      You'll need to sign in to complete your purchase
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
