'use client';

import React from 'react';
import { Product } from '@/redux/slices/cartSlice';

interface OrderSummaryProps {
  items: Product[];
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  total
}) => {
  return (
    <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-[#0E1C4C] border-b border-[#E6E1DC] pb-2">Order Summary</h2>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-[#4B423A]">
            <div className="flex items-center">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm ml-2 text-gray-500">x{item.quantity}</span>
            </div>
            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      

      
      <div className="border-t border-[#E6E1DC] pt-3">
        <div className="flex justify-between font-bold text-lg text-[#0E1C4C]">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
