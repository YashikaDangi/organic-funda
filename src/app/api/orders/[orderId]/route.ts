import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/services/mongodb/serverOrderService';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';

/**
 * GET handler for fetching a specific order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Get orderId from params
    const orderId = params.orderId;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get order by ID
    const order = await getOrderById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Return order data
    return NextResponse.json({
      success: true,
      order
    });
  } catch (error: any) {
    logger.order.error('Error fetching order', {
      error: error.message,
      orderId: params.orderId
    });
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch order',
        error: error.message
      },
      { status: 500 }
    );
  }
}
