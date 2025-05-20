import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { getCartItems, saveCartItems, clearCartInServer as clearCartInMongoDB } from '@/services/mongodb/clientCartService';

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: Product[];
  totalItems: number;
  totalAmount: number;
  isSyncing: boolean;
  lastSynced: string | null;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isSyncing: false,
  lastSynced: null,
  error: null,
};

const calculateTotals = (items: Product[]) => {
  return items.reduce(
    (acc, item) => {
      acc.totalItems += item.quantity;
      acc.totalAmount += item.price * item.quantity;
      return acc;
    },
    { totalItems: 0, totalAmount: 0 }
  );
};

// Async thunks for server operations
export const fetchCartFromServer = createAsyncThunk(
  'cart/fetchFromServer',
  async (userId: string) => {
    try {
      const items = await getCartItems(userId);
      return items;
    } catch (error) {
      throw error instanceof Error ? error.message : 'Failed to fetch cart';
    }
  }
);

export const syncCartWithServer = createAsyncThunk(
  'cart/syncWithServer',
  async ({ userId, items }: { userId: string; items: Product[] }, { rejectWithValue }) => {
    try {
      // Create a deep copy of the items to prevent reference issues
      const itemsCopy = JSON.parse(JSON.stringify(items));
      
      // Always sync the cart, even if empty (to support cart clearing)
      await saveCartItems(userId, itemsCopy);
      
      return itemsCopy;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync cart');
    }
  }
);

// Specific thunk for clearing the cart to ensure it's properly synced with MongoDB
export const clearCartInServerThunk = createAsyncThunk(
  'cart/clearInServer',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      // First clear the local cart
      dispatch(clearCart());
      
      // Use the dedicated function to clear cart in MongoDB
      await clearCartInMongoDB(userId);
      
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear cart');
    }
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== id);
      } else {
        const item = state.items.find(item => item.id === id);
        if (item) {
          item.quantity = quantity;
        }
      }
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
    setCartItems: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart from server
      .addCase(fetchCartFromServer.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(fetchCartFromServer.fulfilled, (state, action) => {
        state.items = action.payload;
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        state.isSyncing = false;
        state.lastSynced = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchCartFromServer.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      // Sync cart with server
      .addCase(syncCartWithServer.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncCartWithServer.fulfilled, (state) => {
        state.isSyncing = false;
        state.lastSynced = new Date().toISOString();
        state.error = null;
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.error.message || 'Failed to sync cart';
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartItems } = cartSlice.actions;

// Export clearCartInServerThunk as clearCartInServer for backward compatibility
export const clearCartInServer = clearCartInServerThunk;

// Selectors
export const selectCart = (state: RootState) => state.cart as CartState;
export const selectCartItems = (state: RootState) => (state.cart as CartState).items;
export const selectCartTotalItems = (state: RootState) => (state.cart as CartState).totalItems;
export const selectCartTotalAmount = (state: RootState) => (state.cart as CartState).totalAmount;
export const selectIsSyncing = (state: RootState) => (state.cart as CartState).isSyncing;
export const selectLastSynced = (state: RootState) => (state.cart as CartState).lastSynced;
export const selectCartError = (state: RootState) => (state.cart as CartState).error;

export default cartSlice.reducer;
