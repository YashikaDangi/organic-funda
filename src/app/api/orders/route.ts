import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { logger } from '@/utils/logger';
import { Order } from '@/models/Order';
import { getOrderById as getOrderByIdFromDB, getUserOrders as getUserOrdersFromDB, createOrder as createOrderInDB } from '@/services/mongodb/serverOrderService';

// GET handler for fetching orders
export async function GET(request: NextRequest) {
  try {
    // Get userId from query params
    const userId = request.nextUrl.searchParams.get('userId');
    const orderId = request.nextUrl.searchParams.get('orderId');
    
    if (!userId && !orderId) {
      return NextResponse.json(
        { error: 'Either User ID or Order ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for orders fetch");
    
    if (orderId) {
      // Get specific order
      const order = await getOrderByIdFromDB(orderId);
      
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: order });
    } else {
      // Get all orders for user
      const orders = await getUserOrdersFromDB(userId!);
      return NextResponse.json({ success: true, data: orders });
    }
  } catch (error) {
    logger.db.error("Error fetching orders", { error });
    return NextResponse.json(
      { error: 'Failed to fetch orders', success: false },
      { status: 500 }
    );
  }
}

// POST handler for creating a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress, billingAddress, paymentMethod } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', success: false },
        { status: 400 }
      );
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Valid items array is required', success: false },
        { status: 400 }
      );
    }
    
    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required', success: false },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for order creation");
    
    // Create order
    const order = await createOrderInDB(
      userId,
      items,
      shippingAddress,
      billingAddress || shippingAddress,
      paymentMethod
    );
    
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    logger.db.error("Error creating order", { error });
    return NextResponse.json(
      { error: 'Failed to create order', success: false },
      { status: 500 }
    );
  }
}
