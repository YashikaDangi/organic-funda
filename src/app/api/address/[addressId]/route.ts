import { NextRequest, NextResponse } from 'next/server';
import { 
  getAddressById, 
  updateAddress as updateAddressInMongoDB,
  deleteAddress as deleteAddressFromMongoDB
} from '@/services/mongodb/serverAddressService';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';

// GET handler for fetching a single address
export async function GET(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const addressId = params.addressId;
    
    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for address fetch by ID");
    
    // Get address
    const address = await getAddressById(addressId);
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(address);
  } catch (error) {
    logger.db.error("Error fetching address by ID", { error });
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}

// PUT handler for updating an address
export async function PUT(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const addressId = params.addressId;
    const body = await request.json();
    
    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for address update");
    
    // Update address
    const updatedAddress = await updateAddressInMongoDB(addressId, body);
    
    return NextResponse.json(updatedAddress);
  } catch (error) {
    logger.db.error("Error updating address", { error });
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting an address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const addressId = params.addressId;
    
    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for address deletion");
    
    // Delete address
    const result = await deleteAddressFromMongoDB(addressId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Address not found or could not be deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.db.error("Error deleting address", { error });
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
