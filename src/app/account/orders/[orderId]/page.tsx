'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrder } from '@/hooks/useOrder';
import { Order, OrderStatus } from '@/models/Order';

const OrderDetailsPage = () => {
  // Use the useParams hook to get the orderId
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getOrderById, loading } = useOrder();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side only rendering to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/login?redirect=account/orders');
    }
  }, [isClient, isAuthenticated, router]);

  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId) {
        try {
          const orderDetails = await getOrderById(orderId);
          
          // Verify that the order belongs to the current user
          if (orderDetails.userId !== user?.uid) {
            router.push('/account/orders');
            return;
          }
          
          setOrder(orderDetails);
        } catch (error) {
          console.error('Error fetching order details:', error);
          router.push('/account/orders');
        }
      }
    };

    if (isClient && isAuthenticated && user) {
      fetchOrderDetails();
    }
  }, [isClient, isAuthenticated, orderId, user, getOrderById, router]);

  // Helper function to get status badge color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAYMENT_COMPLETED:
      case OrderStatus.PROCESSING:
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.PAYMENT_PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PAYMENT_FAILED:
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case OrderStatus.REFUNDED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isClient || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
        <p className="mt-4 text-[#4B423A]">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
        <p className="text-[#4B423A] text-lg">Order not found.</p>
        <button
          onClick={() => router.push('/account/orders')}
          className="mt-4 px-6 py-2 bg-[#7B1113] hover:bg-[#921518] text-white rounded-lg font-medium transition duration-300"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0E1C4C]">Order Details</h1>
          <button
            onClick={() => router.push('/account/orders')}
            className="text-[#4B423A] hover:text-[#0E1C4C] flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0E1C4C]">Order #{order.orderNumber}</h2>
                  <p className="text-[#4B423A] mt-1">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="border-t border-[#E6E1DC] pt-6">
                <h3 className="text-lg font-semibold text-[#0E1C4C] mb-4">Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center pb-4 border-b border-[#E6E1DC] last:border-0 last:pb-0">
                      <div className="flex items-center">
                        {item.image && (
                          <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-[#0E1C4C]">{item.name}</h4>
                          <p className="text-sm text-[#4B423A]">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#0E1C4C]">u20b9{item.price.toFixed(2)}</p>
                        <p className="text-sm text-[#4B423A]">Total: u20b9{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-[#0E1C4C] mb-4">Shipping Address</h3>
              <div className="text-[#4B423A]">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phoneNumber}</p>
                <p className="mt-2">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[#0E1C4C] border-b border-[#E6E1DC] pb-2">Payment Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[#4B423A]">
                  <span>Subtotal</span>
                  <span>u20b9{order.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-[#4B423A]">
                  <span>Tax (18% GST)</span>
                  <span>u20b9{order.tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-[#4B423A]">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? 'Free' : `u20b9${order.shippingCost.toFixed(2)}`}</span>
                </div>
                
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-u20b9{order.discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-[#E6E1DC] pt-3">
                <div className="flex justify-between font-bold text-lg text-[#0E1C4C]">
                  <span>Total</span>
                  <span>u20b9{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-[#E6E1DC] pt-4 mt-4">
                <h4 className="font-medium text-[#0E1C4C] mb-2">Payment Information</h4>
                <div className="text-sm text-[#4B423A] space-y-1">
                  <p>Method: {order.paymentDetails.paymentMethod}</p>
                  <p>Status: {order.paymentDetails.paymentStatus}</p>
                  {order.paymentDetails.transactionId && (
                    <p>Transaction ID: {order.paymentDetails.transactionId}</p>
                  )}
                </div>
              </div>

              {(order.status === OrderStatus.DELIVERED || order.status === OrderStatus.SHIPPED) && (
                <div className="pt-4">
                  <button className="w-full py-2 px-4 bg-[#0E1C4C] hover:bg-[#1A2C5C] text-white rounded-lg font-medium transition duration-300">
                    Track Order
                  </button>
                </div>
              )}

              {order.status === OrderStatus.CREATED && (
                <div className="pt-4">
                  <button className="w-full py-2 px-4 bg-[#7B1113] hover:bg-[#921518] text-white rounded-lg font-medium transition duration-300">
                    Complete Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
