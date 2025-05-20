import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';
import { updatePaymentDetails as updatePaymentDetailsInDB } from '@/services/mongodb/serverOrderService';

// PUT handler for updating payment details
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
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
    logger.db.info("Connected to MongoDB for payment details update");
    
    // Update payment details
    const updatedOrder = await updatePaymentDetailsInDB(orderId, paymentDetails);
    
    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    logger.db.error("Error updating payment details", { error });
    return NextResponse.json(
      { error: 'Failed to update payment details', success: false },
      { status: 500 }
    );
  }
}
