import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';
import { updateOrderStatus as updateOrderStatusInDB } from '@/services/mongodb/serverOrderService';

// PUT handler for updating order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // Extract orderId outside try/catch to use in error logging
  let orderId: string | null = null;
  
  try {
    const paramsData = await params;
    orderId = paramsData.orderId;
    const body = await request.json();
    const { status } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required', success: false },
        { status: 400 }
      );
    }
    
    if (!status) {
      return NextResponse.json(
        { error: 'Order status is required', success: false },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for order status update");
    
    // Update order status
    const updatedOrder = await updateOrderStatusInDB(orderId, status);
    
    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    logger.db.error("Error updating order status", { error });
    return NextResponse.json(
      { error: 'Failed to update order status', success: false },
      { status: 500 }
    );
  }
}
