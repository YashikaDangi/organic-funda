import { createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginStart, loginSuccess, loginFailure, logout } from '../slices/authSlice';

// Thunk for Google sign-in
export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { dispatch }) => {
    dispatch(loginStart());
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create a serializable user object
      const serializableUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      
      dispatch(loginSuccess(serializableUser));
      
      // Return only serializable data
      return serializableUser;
    } catch (error: any) {
      dispatch(loginFailure(error.message || 'Failed to sign in'));
      throw new Error(error.message || 'Failed to sign in');
    }
  }
);

// Thunk for sign out
export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch }) => {
    try {
      await signOut(auth);
      dispatch(logout());
      return { success: true };  // Return a serializable value
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }
);
