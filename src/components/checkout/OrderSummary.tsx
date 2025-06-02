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
    <div className="bg-white border border-primary/10 rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-primary-dark border-b border-primary/10 pb-2 font-heading">Order Summary</h2>
      
      <div className="space-y-4 mt-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-primary-dark">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent/10 rounded-md overflow-hidden flex items-center justify-center border border-accent/20">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "/mushroom1.jpg";
                  }}
                />
              </div>
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-sm ml-2 text-primary-dark/60">x{item.quantity}</span>
              </div>
            </div>
            <span className="text-secondary font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-primary/10 pt-4 mt-2">
        <div className="flex justify-between font-bold text-lg text-primary-dark">
          <span>Total</span>
          <span className="text-secondary text-xl">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
