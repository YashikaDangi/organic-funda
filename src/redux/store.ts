import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import storage from 'redux-persist/lib/storage';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import { loggerMiddleware } from './middleware/logger';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'auth'], // only persist these reducers
};

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
          'auth/signInWithGoogle/pending',
          'auth/signInWithGoogle/fulfilled',
          'auth/signInWithGoogle/rejected',
          'auth/signOut/pending',
          'auth/signOut/fulfilled',
          'auth/signOut/rejected'
        ],
      },
    }).concat(loggerMiddleware),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
