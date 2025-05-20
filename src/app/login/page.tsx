'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, signInWithGoogle, error, clearError } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Get redirect URL from query params
  const redirect = searchParams.get('redirect') || '/';

  // Client-side only rendering to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isClient && isAuthenticated) {
      router.push(redirect);
    }
  }, [isClient, isAuthenticated, router, redirect]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Redirect will happen automatically via the useEffect
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };
  
  // Clear any previous errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  if (!isClient || (isAuthenticated && !error)) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
        <p className="mt-4 text-[#4B423A]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0E1C4C]">Sign In</h1>
          <p className="mt-2 text-[#4B423A]">
            {redirect !== '/' 
              ? 'Please sign in to continue to checkout' 
              : 'Sign in to your account to access your orders and addresses'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-lg border border-[#CFC5BA] text-[#4B423A] hover:bg-[#F5F2EF] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="mt-8 text-center text-sm text-[#4B423A]">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-[#7B1113] hover:text-[#921518]">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#7B1113] hover:text-[#921518]">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
