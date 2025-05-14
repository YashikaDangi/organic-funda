"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

const CartPage: React.FC = () => {
  const { cart } = useAuth();

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-[#0E1C4C] mb-10">Your Cart</h1>

      {cart.length > 0 ? (
        <div className="w-full max-w-2xl bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6 space-y-6">
          {cart.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b border-[#E6E1DC] pb-4"
            >
              <div className="text-[#4B423A] font-medium">
                {item.name} <span className="text-sm text-[#7A6D61]">(x{item.quantity})</span>
              </div>
              <div className="text-[#0E1C4C] font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t border-[#E6E1DC] text-lg font-bold text-[#0E1C4C]">
            <span>Total</span>
            <span>${calculateTotal()}</span>
          </div>

          <button className="w-full bg-[#7B1113] hover:bg-[#921518] text-white py-3 rounded-lg font-semibold transition duration-300">
            Proceed to Checkout
          </button>
        </div>
      ) : (
        <div className="text-center mt-24 text-[#4B423A] text-lg">
          <p className="text-2xl mb-2">🛒</p>
          <p>Your cart is currently empty.</p>
        </div>
      )}
    </div>
  );
};

export default CartPage;
