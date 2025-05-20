import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserAddresses, 
  addAddress as addAddressToMongoDB
} from '@/services/mongodb/serverAddressService';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';
import { AddressFormData } from '@/models/Address';

// GET handler for fetching user addresses
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
    logger.db.info("Connected to MongoDB for address fetch");
    
    // Get addresses
    const addresses = await getUserAddresses(userId);
    
    return NextResponse.json(addresses);
  } catch (error) {
    logger.db.error("Error fetching addresses", { error });
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST handler for adding a new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...addressData } = body as { userId: string } & AddressFormData;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (!addressData.fullName || !addressData.phoneNumber || !addressData.addressLine1 || 
        !addressData.city || !addressData.state || !addressData.postalCode) {
      return NextResponse.json(
        { error: 'Required address fields are missing' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for address creation");
    
    // Add address
    const newAddress = await addAddressToMongoDB(userId, addressData);
    
    return NextResponse.json(newAddress);
  } catch (error) {
    logger.db.error("Error adding address", { error });
    return NextResponse.json(
      { error: 'Failed to add address' },
      { status: 500 }
    );
  }
}
