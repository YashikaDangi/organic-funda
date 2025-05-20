import { connectToDatabase } from '@/lib/mongodb';
import Address from '@/models/mongodb/Address';
import { Address as AddressType, AddressFormData } from '@/models/Address';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Helper function to handle MongoDB errors
const handleMongoDBError = (error: any): void => {
  // Only log detailed errors in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    if (error.name === 'ValidationError') {
      logger.db.error('MongoDB validation error', { error: error.message });
    } else if (error.name === 'MongoServerError') {
      logger.db.error('MongoDB server error', { error: error.message, code: error.code });
    } else {
      logger.db.error('MongoDB operation failed', { error: error.message || 'unknown' });
    }
  }
};

// Retry mechanism for MongoDB operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry validation errors - they won't resolve with retries
      if (error.name === 'ValidationError') {
        break;
      }
      
      // Wait before next retry with exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
};

// Convert MongoDB document to Address type
const convertToAddressType = (addressDoc: any): AddressType => {
  const { _id, __v, ...addressData } = addressDoc.toObject ? addressDoc.toObject() : addressDoc;
  return {
    id: _id.toString(),
    ...addressData,
    createdAt: addressData.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: addressData.updatedAt?.toISOString() || new Date().toISOString()
  };
};

// Add a new address
export const addAddress = async (userId: string, addressData: AddressFormData): Promise<AddressType> => {
  if (!userId) {
    throw new Error('User ID is required to add an address');
  }
  
  try {
    await connectToDatabase();
    
    const address = new Address({
      userId,
      ...addressData,
    });
    
    const savedAddress = await retryOperation(async () => {
      return await address.save();
    });
    
    // If this is the default address, update any existing default addresses
    if (addressData.isDefault) {
      await updateDefaultAddress(userId, savedAddress._id.toString());
    }
    
    return convertToAddressType(savedAddress);
  } catch (error) {
    handleMongoDBError(error);
    throw error;
  }
};

// Update an existing address
export const updateAddress = async (addressId: string, addressData: Partial<AddressFormData>): Promise<AddressType> => {
  if (!addressId) {
    throw new Error('Address ID is required to update an address');
  }
  
  try {
    await connectToDatabase();
    
    // Get the current address data
    const currentAddress = await Address.findById(addressId);
    if (!currentAddress) {
      throw new Error('Address not found');
    }
    
    const userId = currentAddress.userId;
    
    // Update the address
    const updatedAddress = await retryOperation(async () => {
      return await Address.findByIdAndUpdate(
        addressId,
        { $set: addressData },
        { new: true, runValidators: true }
      );
    });
    
    if (!updatedAddress) {
      throw new Error('Failed to update address');
    }
    
    // If this is being set as the default address, update any existing default addresses
    if (addressData.isDefault) {
      await updateDefaultAddress(userId, addressId);
    }
    
    return convertToAddressType(updatedAddress);
  } catch (error) {
    handleMongoDBError(error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (addressId: string): Promise<boolean> => {
  if (!addressId) {
    throw new Error('Address ID is required to delete an address');
  }
  
  try {
    await connectToDatabase();
    
    const result = await retryOperation(async () => {
      return await Address.findByIdAndDelete(addressId);
    });
    
    return !!result;
  } catch (error) {
    handleMongoDBError(error);
    throw error;
  }
};

// Get all addresses for a user
export const getUserAddresses = async (userId: string): Promise<AddressType[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    await connectToDatabase();
    
    const addresses = await retryOperation(async () => {
      return await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    });
    
    return addresses.map(convertToAddressType);
  } catch (error) {
    handleMongoDBError(error);
    return [];
  }
};

// Get a single address by ID
export const getAddressById = async (addressId: string): Promise<AddressType | null> => {
  if (!addressId) {
    return null;
  }
  
  try {
    await connectToDatabase();
    
    const address = await retryOperation(async () => {
      return await Address.findById(addressId);
    });
    
    if (!address) {
      return null;
    }
    
    return convertToAddressType(address);
  } catch (error) {
    handleMongoDBError(error);
    return null;
  }
};

// Get the default address for a user
export const getDefaultAddress = async (userId: string): Promise<AddressType | null> => {
  if (!userId) {
    return null;
  }
  
  try {
    await connectToDatabase();
    
    const address = await retryOperation(async () => {
      return await Address.findOne({ userId, isDefault: true });
    });
    
    if (!address) {
      return null;
    }
    
    return convertToAddressType(address);
  } catch (error) {
    handleMongoDBError(error);
    return null;
  }
};

// Helper function to update default address status
export const updateDefaultAddress = async (userId: string, newDefaultAddressId: string): Promise<void> => {
  if (!userId || !newDefaultAddressId) {
    return;
  }
  
  try {
    await connectToDatabase();
    
    // Reset all other addresses to non-default
    await retryOperation(async () => {
      return await Address.updateMany(
        { userId, _id: { $ne: newDefaultAddressId }, isDefault: true },
        { $set: { isDefault: false } }
      );
    });
    
    // Ensure the new default address is set to default
    await retryOperation(async () => {
      return await Address.findByIdAndUpdate(
        newDefaultAddressId,
        { $set: { isDefault: true } }
      );
    });
  } catch (error) {
    handleMongoDBError(error);
    throw error;
  }
};
