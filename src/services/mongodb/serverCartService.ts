import { connectToDatabase } from '@/lib/mongodb';
import Cart from '@/models/mongodb/Cart';
import { Product } from '@/redux/slices/cartSlice';
import { logger } from '@/utils/logger';

// Helper function to handle MongoDB errors
const handleMongoDBError = (error: any): void => {
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

// Get cart items from MongoDB with retry logic
export const getCartItems = async (userId: string): Promise<Product[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    await connectToDatabase();
    
    return await retryOperation(async () => {
      const cart = await Cart.findOne({ userId });
      
      if (cart) {
        return cart.items || [];
      }
      
      return [];
    });
  } catch (error) {
    handleMongoDBError(error);
    
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Save cart items to MongoDB with retry logic
export const saveCartItems = async (userId: string, items: Product[]): Promise<void> => {
  if (!userId) {
    return;
  }
  
  try {
    await connectToDatabase();
    
    // Create a clean copy of the items to ensure no circular references
    const cleanItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));
    
    // Use retry operation to handle potential network issues
    await retryOperation(async () => {
      // Use findOneAndUpdate with upsert to create if not exists
      await Cart.findOneAndUpdate(
        { userId },
        { 
          items: cleanItems, 
          lastSyncedFrom: 'web-client',
          syncTimestamp: Date.now()
        },
        { upsert: true, new: true }
      );
      return true;
    });
  } catch (error) {
    handleMongoDBError(error);
    
    // Store in localStorage as backup only in non-production environments
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      try {
        localStorage.setItem(`pendingCartSync_${userId}`, JSON.stringify({
          items,
          timestamp: Date.now()
        }));
      } catch (localError) {
        // Silent fail in production
      }
    }
    
    // Re-throw the error so the caller knows it failed
    throw error;
  }
};

// Function to explicitly clear the cart in MongoDB
export const clearCartInMongoDB = async (userId: string): Promise<void> => {
  if (!userId) {
    return;
  }
  
  try {
    await connectToDatabase();
    
    // Set an empty items array and update the timestamp
    await retryOperation(async () => {
      await Cart.findOneAndUpdate(
        { userId },
        { 
          items: [], 
          lastSyncedFrom: 'web-client',
          syncTimestamp: Date.now()
        },
        { upsert: true, new: true }
      );
      return true;
    });
  } catch (error) {
    handleMongoDBError(error);
    throw error;
  }
};

// Export handleMongoDBError for use in other modules
export { handleMongoDBError };
