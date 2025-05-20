"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const CartPage: React.FC = () => {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Client-side only rendering to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // We can use the totalAmount from Redux directly instead of calculating it here
  const formattedTotal = totalAmount.toFixed(2);
  
  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-[#0E1C4C] mb-10">Your Cart</h1>

      {cart.length > 0 ? (
        <div className="w-full max-w-2xl bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6 space-y-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E6E1DC] pb-4 gap-4"
            >
              <div className="text-[#4B423A] font-medium">
                {item.name}
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                <div className="flex items-center border border-[#CFC5BA] rounded-lg overflow-hidden">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="px-3 py-1 bg-[#EFEAE6] hover:bg-[#E6E1DC] text-[#4B423A]"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-center w-10">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-[#EFEAE6] hover:bg-[#E6E1DC] text-[#4B423A]"
                  >
                    +
                  </button>
                </div>
                
                <div className="text-[#0E1C4C] font-semibold min-w-[80px] text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#7B1113] hover:text-[#921518] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t border-[#E6E1DC] text-lg font-bold text-[#0E1C4C]">
            <span>Total</span>
            <span>${formattedTotal}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#7B1113] hover:bg-[#921518]'} text-white py-3 rounded-lg font-semibold transition duration-300`}
          >
            Proceed to Checkout
          </button>
          
          {isClient && !isAuthenticated && cart.length > 0 && (
            <p className="mt-3 text-sm text-[#4B423A] text-center">
              You'll need to sign in to complete your purchase.
            </p>
          )}
        </div>
      ) : (
        <div className="text-center mt-24 text-[#4B423A] text-lg">
          <p className="text-2xl mb-2">🛒</p>
          <p>Your cart is currently empty.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-[#0E1C4C] hover:bg-[#1A2C5C] text-white rounded-lg font-medium transition duration-300"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
