"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";

const Product: React.FC = () => {
  const { cart } = useAuth();

  // Calculate total bill
  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-start py-10 px-4">
      {/* Cart Summary Bill - centered in the middle */}
      {cart.length > 0 ? (
        <div className="mt-10 w-full max-w-md bg-white border-2 border-dashed border-green-400 rounded-lg shadow-md p-6">
          <h3 className="text-center text-2xl font-bold text-green-700 mb-4">
            🧾 Your Bill
          </h3>

          <div className="divide-y divide-green-200">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between py-2 text-gray-700 font-medium"
              >
                <span>
                  {item.name} (x{item.quantity})
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-green-300 mt-4 pt-4 flex justify-between text-lg font-bold text-green-800">
            <span>Total</span>
            <span>${calculateTotal()}</span>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-20 text-lg">
          🛒 Your cart is empty.
        </p>
      )}
    </div>
  );
};

export default Product;
