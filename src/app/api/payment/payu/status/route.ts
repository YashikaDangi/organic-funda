import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/services/mongodb/serverOrderService';
import { logger } from '@/utils/logger';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * Get payment status
 * This API route checks the payment status of an order
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for payment status check");
    // Get order ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    
    // Log the received order ID for debugging
    logger.payment.info('Checking payment status for order', { 
      orderId,
      searchParams: Object.fromEntries(searchParams.entries())
    });
    
    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Order ID is required' 
      }, { status: 400 });
    }
    
    // Get the order
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.payment.error('Order not found for status check', { orderId });
      return NextResponse.json({ 
        success: false, 
        message: 'Order not found' 
      }, { status: 404 });
    }
    
    // Return complete order data
    return NextResponse.json({ 
      success: true,
      data: order
    });
  } catch (error: any) {
    logger.payment.error('Error checking payment status', { error: error.message });
    return NextResponse.json({ 
      success: false, 
      message: 'Error checking payment status',
      error: error.message 
    }, { status: 500 });
  }
}
