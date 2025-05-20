import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Order, OrderStatus, PaymentDetails, PaymentMethod, PaymentStatus } from '@/models/Order';
import { Address } from '@/models/Address';
import { Product } from './cartSlice';
import { createOrder, updateOrderStatus, updatePaymentDetails, getOrderById, getUserOrders } from '@/services/orderService';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

// Async thunks for order operations
export const createUserOrder = createAsyncThunk(
  'order/createUserOrder',
  async ({
    userId,
    items,
    shippingAddress,
    billingAddress,
    paymentMethod
  }: {
    userId: string;
    items: Product[];
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: PaymentMethod;
  }, { rejectWithValue }) => {
    try {
      const order = await createOrder(
        userId,
        items,
        shippingAddress,
        billingAddress,
        paymentMethod
      );
      return order;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create order');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (userId: string, { rejectWithValue }) => {
    try {
      const orders = await getUserOrders(userId);
      return orders;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const order = await getOrderById(orderId);
      if (!order) {
        return rejectWithValue('Order not found');
      }
      return order;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch order');
    }
  }
);

export const updateOrderPaymentDetails = createAsyncThunk(
  'order/updateOrderPaymentDetails',
  async ({
    orderId,
    paymentDetails
  }: {
    orderId: string;
    paymentDetails: Partial<PaymentDetails>;
  }, { rejectWithValue }) => {
    try {
      const order = await updatePaymentDetails(orderId, paymentDetails);
      return order;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update payment details');
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  'order/updateOrderStatus',
  async ({
    orderId,
    status
  }: {
    orderId: string;
    status: OrderStatus;
  }, { rejectWithValue }) => {
    try {
      const order = await updateOrderStatus(orderId, status);
      return order;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update order status');
    }
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create user order
      .addCase(createUserOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(createUserOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create order';
      })
      
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order';
      })
      
      // Update order payment details
      .addCase(updateOrderPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderPaymentDetails.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        
        // Update the order in the orders array
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        state.loading = false;
      })
      .addCase(updateOrderPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update payment details';
      })
      
      // Update order status
      .addCase(updateOrderStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        
        // Update the order in the orders array
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        state.loading = false;
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order status';
      });
  },
});

export const { clearCurrentOrder, setCurrentOrder, clearOrders } = orderSlice.actions;

// Selectors
export const selectOrders = (state: RootState) => state.order.orders;
export const selectCurrentOrder = (state: RootState) => state.order.currentOrder;
export const selectOrderLoading = (state: RootState) => state.order.loading;
export const selectOrderError = (state: RootState) => state.order.error;

export default orderSlice.reducer;
