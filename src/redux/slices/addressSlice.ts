import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Address, AddressFormData } from '@/models/Address';
import { addAddress, updateAddress, deleteAddress, getUserAddresses, getDefaultAddress } from '@/services/addressService';

interface AddressState {
  addresses: Address[];
  defaultAddress: Address | null;
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  defaultAddress: null,
  loading: false,
  error: null,
};

// Async thunks for address operations
export const fetchUserAddresses = createAsyncThunk(
  'address/fetchUserAddresses',
  async (userId: string, { rejectWithValue }) => {
    try {
      const addresses = await getUserAddresses(userId);
      return addresses;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch addresses');
    }
  }
);

export const fetchDefaultAddress = createAsyncThunk(
  'address/fetchDefaultAddress',
  async (userId: string, { rejectWithValue }) => {
    try {
      const address = await getDefaultAddress(userId);
      return address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch default address');
    }
  }
);

export const addUserAddress = createAsyncThunk(
  'address/addUserAddress',
  async ({ userId, addressData }: { userId: string; addressData: AddressFormData }, { rejectWithValue }) => {
    try {
      const address = await addAddress(userId, addressData);
      return address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add address');
    }
  }
);

export const updateUserAddress = createAsyncThunk(
  'address/updateUserAddress',
  async ({ addressId, addressData }: { addressId: string; addressData: Partial<AddressFormData> }, { rejectWithValue }) => {
    try {
      const address = await updateAddress(addressId, addressData);
      return address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update address');
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  'address/deleteUserAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      await deleteAddress(addressId);
      return addressId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete address');
    }
  }
);

export const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearAddresses: (state) => {
      state.addresses = [];
      state.defaultAddress = null;
    },
    setDefaultAddress: (state, action: PayloadAction<Address>) => {
      state.defaultAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user addresses
      .addCase(fetchUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.loading = false;
        
        // Update default address if it exists in the fetched addresses
        const defaultAddress = action.payload.find(address => address.isDefault);
        if (defaultAddress) {
          state.defaultAddress = defaultAddress;
        }
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch addresses';
      })
      
      // Fetch default address
      .addCase(fetchDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDefaultAddress.fulfilled, (state, action) => {
        state.defaultAddress = action.payload;
        state.loading = false;
      })
      .addCase(fetchDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch default address';
      })
      
      // Add user address
      .addCase(addUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
        state.loading = false;
        
        // If this is the default address, update the default address
        if (action.payload.isDefault) {
          state.defaultAddress = action.payload;
        }
      })
      .addCase(addUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add address';
      })
      
      // Update user address
      .addCase(updateUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(address => address.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        state.loading = false;
        
        // If this is the default address, update the default address
        if (action.payload.isDefault) {
          state.defaultAddress = action.payload;
        } else if (state.defaultAddress?.id === action.payload.id) {
          // If this was the default address but is no longer, clear the default address
          state.defaultAddress = null;
        }
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update address';
      })
      
      // Delete user address
      .addCase(deleteUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(address => address.id !== action.payload);
        state.loading = false;
        
        // If the deleted address was the default address, clear the default address
        if (state.defaultAddress?.id === action.payload) {
          state.defaultAddress = null;
        }
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete address';
      });
  },
});

export const { clearAddresses, setDefaultAddress } = addressSlice.actions;

// Selectors
export const selectAddresses = (state: RootState) => state.address.addresses;
export const selectDefaultAddress = (state: RootState) => state.address.defaultAddress;
export const selectAddressLoading = (state: RootState) => state.address.loading;
export const selectAddressError = (state: RootState) => state.address.error;

export default addressSlice.reducer;
