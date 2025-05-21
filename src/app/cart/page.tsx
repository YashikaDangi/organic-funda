"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const CartPage: React.FC = () => {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formattedTotal = totalAmount.toFixed(2);

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center">
      {cart.length > 0 ? (
        <div className="w-full max-w-2xl bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6 space-y-6 transition-all duration-300 hover:shadow-xl">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E6E1DC] pb-4 gap-4 hover:bg-[#F9F7F4] p-2 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F5F2EF] rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "/mushroom1.jpg"; // optional fallback
                    }}
                  />
                </div>

                <div className="text-[#4B423A] font-medium text-base">
                  {item.name}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                <div className="flex items-center border border-[#CFC5BA] rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="px-3 py-1 bg-[#EFEAE6] hover:bg-[#E6E1DC] text-[#4B423A] transition duration-200"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-center w-10 text-[#1F1F1F] font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-[#EFEAE6] hover:bg-[#E6E1DC] text-[#4B423A] transition duration-200"
                  >
                    +
                  </button>
                </div>

                <div className="text-[#0E1C4C] font-semibold min-w-[80px] text-right text-base">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#7B1113] hover:text-[#921518] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-[#E6E1DC]">
            <div className="flex justify-between items-center text-lg font-bold text-[#0E1C4C]">
              <span>Total</span>
              <span>₹{formattedTotal}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full ${
                cart.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#7B1113] hover:bg-[#921518]"
              } text-white py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              Proceed to Checkout
            </button>

            <Link
              href="/"
              className="w-full text-center py-3 border border-[#0E1C4C] text-[#0E1C4C] rounded-lg font-semibold hover:bg-[#F5F2EF] transition duration-300 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {isClient && !isAuthenticated && cart.length > 0 && (
            <p className="mt-3 text-sm text-[#4B423A] text-center">
              You'll need to sign in to complete your purchase.
            </p>
          )}
        </div>
      ) : (
        <div className="text-center mt-16 text-[#4B423A] text-lg bg-white p-10 rounded-xl shadow-lg border border-[#CFC5BA] max-w-md mx-auto">
          <div className="w-24 h-24 bg-[#EFEAE6] rounded-full shadow-inner flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-[#0E1C4C]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0E1C4C] mb-2">
            Your cart is empty
          </h2>
          <p className="mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-[#0E1C4C] hover:bg-[#1A2C5C] text-white rounded-lg font-medium transition duration-300 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
