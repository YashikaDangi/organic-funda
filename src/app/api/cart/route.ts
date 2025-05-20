import { NextRequest, NextResponse } from 'next/server';
import { getCartItems, saveCartItems, clearCartInMongoDB } from '@/services/mongodb/serverCartService';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';

// GET handler for fetching cart items
export async function GET(request: NextRequest) {
  try {
    // Get userId from query params
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for cart fetch");
    
    // Get cart items
    const items = await getCartItems(userId);
    
    return NextResponse.json({ items });
  } catch (error) {
    logger.db.error("Error fetching cart", { error });
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST handler for saving cart items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Valid items array is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for cart update");
    
    // Save cart items
    await saveCartItems(userId, items);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.db.error("Error saving cart", { error });
    return NextResponse.json(
      { error: 'Failed to save cart' },
      { status: 500 }
    );
  }
}

// DELETE handler for clearing cart
export async function DELETE(request: NextRequest) {
  try {
    // Get userId from query params
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for cart deletion");
    
    // Clear cart
    await clearCartInMongoDB(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.db.error("Error clearing cart", { error });
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
