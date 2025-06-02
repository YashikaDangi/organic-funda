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
    <div className="min-h-screen bg-gradient-to-b from-primary-light/10 to-white py-20 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-primary-dark mb-8 font-heading">Your Cart</h1>
      {cart.length > 0 ? (
        <div className="w-full max-w-2xl bg-white border border-primary/10 rounded-xl shadow-lg p-6 space-y-6 transition-all duration-300 hover:shadow-xl">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-primary/10 pb-4 gap-4 hover:bg-primary-light/5 p-2 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-accent/10 rounded-lg overflow-hidden flex items-center justify-center border border-accent/20">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "/mushroom1.jpg"; // optional fallback
                    }}
                  />
                </div>

                <div className="text-primary-dark font-medium text-base">
                  {item.name}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                <div className="flex items-center border border-accent/30 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="px-3 py-1 bg-accent/10 hover:bg-accent/20 text-primary-dark transition-all duration-200"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-center w-10 text-primary-dark font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-accent/10 hover:bg-accent/20 text-primary-dark transition-all duration-200"
                  >
                    +
                  </button>
                </div>

                <div className="text-secondary font-semibold min-w-[80px] text-right text-base">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-secondary hover:text-secondary-dark transition-all duration-200 bg-secondary/5 hover:bg-secondary/10 p-2 rounded-full"
                  aria-label="Remove item"
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

          <div className="mt-6 pt-4 border-t border-primary/10">
            <div className="flex justify-between items-center text-lg font-bold text-primary-dark">
              <span>Total</span>
              <span className="text-secondary text-xl">₹{formattedTotal}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full ${
                cart.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-secondary hover:bg-secondary-dark"
              } text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg`}
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
              className="w-full text-center py-3 border border-primary-dark text-primary-dark rounded-lg font-semibold hover:bg-primary-light/10 transition-all duration-300 flex items-center justify-center gap-2"
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
        <div className="text-center mt-8 text-primary-dark text-lg bg-white p-10 rounded-xl shadow-lg border border-primary/10 max-w-md mx-auto">
          <div className="w-24 h-24 bg-accent/10 rounded-full shadow-inner flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-accent"
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
          <h2 className="text-2xl font-bold text-primary-dark mb-2 font-heading">
            Your cart is empty
          </h2>
          <p className="mb-8 text-primary-dark/80">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-medium transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
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
