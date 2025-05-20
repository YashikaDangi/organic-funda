import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAddress } from '@/services/mongodb/serverAddressService';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';

// GET handler for fetching the default address for a user
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
    logger.db.info("Connected to MongoDB for default address fetch");
    
    // Get default address
    const defaultAddress = await getDefaultAddress(userId);
    
    if (!defaultAddress) {
      return NextResponse.json(
        { message: 'No default address found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(defaultAddress);
  } catch (error) {
    logger.db.error("Error fetching default address", { error });
    return NextResponse.json(
      { error: 'Failed to fetch default address' },
      { status: 500 }
    );
  }
}
