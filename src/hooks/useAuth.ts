'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectUser, selectIsAuthenticated, selectLoading, selectError, clearError } from '@/redux/slices/authSlice';
import { signInWithGoogle as signInWithGoogleThunk, signOutUser } from '@/redux/thunks/authThunks';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginSuccess, logout } from '@/redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        dispatch(loginSuccess({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        }));
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const signInWithGoogle = async () => {
    try {
      return await dispatch(signInWithGoogleThunk()).unwrap();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await dispatch(signOutUser()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  
  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    signInWithGoogle,
    logout: logoutUser,
    clearError: handleClearError
  };
};
