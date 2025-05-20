'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrder } from '@/hooks/useOrder';
import { Order, OrderStatus } from '@/models/Order';

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getOrders, loading } = useOrder();
  
  const [orders, setOrders] = useState<Order[]>([]);
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

  // Fetch orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.uid) {
        try {
          const userOrders = await getOrders(user.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
    };

    if (isClient && isAuthenticated) {
      fetchOrders();
    }
  }, [isClient, isAuthenticated, user, getOrders]);

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
    });
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
        <p className="mt-4 text-[#4B423A]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0E1C4C] mb-10">Your Orders</h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E6E1DC]">
                <thead className="bg-[#F5F2EF]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#4B423A] uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#4B423A] uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#4B423A] uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#4B423A] uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#4B423A] uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#4B423A] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E6E1DC]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F9F7F5]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0E1C4C]">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B423A]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B423A]">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B423A]">
                        {order.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/account/orders/${order.id}`)}
                          className="text-[#7B1113] hover:text-[#921518]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-12 text-center">
            <p className="text-2xl mb-4">🛍️</p>
            <h2 className="text-xl font-semibold text-[#0E1C4C] mb-2">No Orders Yet</h2>
            <p className="text-[#4B423A] mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-[#7B1113] hover:bg-[#921518] text-white rounded-lg font-medium transition duration-300"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
