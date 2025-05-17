'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectUser, selectIsAuthenticated } from '@/redux/slices/authSlice';
import { signInWithGoogle, signOutUser } from '@/redux/thunks/authThunks';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginSuccess, logout } from '@/redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

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

  const login = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logoutUser = async () => {
    try {
      await dispatch(signOutUser()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout: logoutUser
  };
};
