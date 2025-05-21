import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';
import { updatePaymentDetails as updatePaymentDetailsInDB } from '@/services/mongodb/serverOrderService';

// PUT handler for updating payment details
export async function PUT(
  request: NextRequest,
) {
  try {
    // Extract orderId from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const orderId = pathParts[pathParts.length - 2]; // Since the path is /api/orders/[orderId]/payment
    
    const body = await request.json();
    const { paymentDetails } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required', success: false },
        { status: 400 }
      );
    }
    
    if (!paymentDetails) {
      return NextResponse.json(
        { error: 'Payment details are required', success: false },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for payment update");
    
    // Update payment details
    const result = await updatePaymentDetailsInDB(orderId, paymentDetails);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update payment details', success: false },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment details updated successfully' 
    });
  } catch (error) {
    logger.db.error("Error updating payment details", { error });
    return NextResponse.json(
      { error: 'Failed to update payment details', success: false },
      { status: 500 }
    );
  }
}
