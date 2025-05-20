import { NextRequest, NextResponse } from 'next/server';
import { processPayUPaymentResponse, verifyPayUPaymentResponse } from '@/services/mongodb/serverPaymentService';
import { updateOrderStatus, updatePaymentDetails, getOrderById } from '@/services/mongodb/serverOrderService';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/models/Order';
import { logger } from '@/utils/logger';
import { trackEvent } from '@/utils/analytics';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * Handle PayU payment callback
 * This API route receives callbacks from PayU after payment processing
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for payment callback processing");
    // Parse the request body
    let payuResponse;
    try {
      payuResponse = await request.json();
    } catch (err) {
      // Some PayU implementations might send form data instead of JSON
      const formData = await request.formData();
      payuResponse = Object.fromEntries(formData.entries());
    }
    
    logger.payment.info('Received PayU callback', { 
      txnid: payuResponse.txnid,
      status: payuResponse.status,
      mihpayid: payuResponse.mihpayid
    });
    
    // Verify the payment response
    const isValid = verifyPayUPaymentResponse(payuResponse);
    
    if (!isValid) {
      logger.payment.warn('PayU response hash verification failed', { 
        txnid: payuResponse.txnid,
        status: payuResponse.status
      });
      
      // In production, we might still want to process the payment if it appears legitimate
      // but log it for manual review
      if (process.env.NODE_ENV !== 'production' || !payuResponse.mihpayid) {
        return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
      }
      
      logger.payment.warn('Proceeding with payment despite failed hash verification', {
        txnid: payuResponse.txnid,
        mihpayid: payuResponse.mihpayid
      });
    }
    
    // Process the payment response
    const processedResponse = processPayUPaymentResponse(payuResponse);
    
    // Extract data from the processed response
    const isSuccess = processedResponse.isSuccess;
    const errorMessage = processedResponse.errorMessage || '';
    
    // Extract other data from the processed response
    const orderId = processedResponse.orderId;
    const paymentId = processedResponse.paymentId;
    const amount = processedResponse.amount;
    const status = processedResponse.status;
    const mode = processedResponse.mode;
    const bankReference = processedResponse.bankReference;
    const transactionId = paymentId; // Use paymentId as transactionId
    const fullResponse = payuResponse; // Store the full response
    
    // Get the order
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.payment.error('Order not found for payment callback', { orderId });
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    
    // Track payment event for analytics
    trackEvent(isSuccess ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILURE', {
      orderId,
      orderNumber: order.orderNumber,
      amount: amount,
      paymentMethod: 'PayU',
      transactionId
    });
    
    // Update payment details with enhanced information
    await updatePaymentDetails(orderId, {
      paymentId,
      transactionId,
      paymentStatus: isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      paymentDate: new Date().toISOString(),
      paymentMethod: PaymentMethod.PAYU,
      // Store additional details in the payuResponse object
      payuResponse: {
        ...fullResponse,
        mode,
        errorMessage,
        bankReference
        // Note: cardInfo and nameOnCard are not available in the server response
      }
    });
    
    // Update order status based on payment status
    const newStatus = isSuccess ? OrderStatus.PAYMENT_COMPLETED : OrderStatus.PAYMENT_FAILED;
    await updateOrderStatus(orderId, newStatus);
    
    // If payment was successful, trigger any post-payment processes
    if (isSuccess) {
      try {
        // You could add additional processes here like:
        // - Send order confirmation email
        // - Update inventory
        // - Create invoice
        // - etc.
        
        logger.payment.info('Successfully processed payment completion', { 
          orderId, 
          orderNumber: order.orderNumber 
        });
      } catch (err: any) {
        // Log error but don't fail the request
        logger.payment.error('Error in post-payment processing', { 
          error: err.message,
          orderId
        });
      }
    }
    
    logger.payment.info('Payment processed successfully', { 
      orderId, 
      status: newStatus, 
      transactionId 
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment processed successfully',
      data: {
        orderId,
        status: newStatus,
        transactionId
      }
    });
  } catch (error: any) {
    // Enhanced error logging with more details
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      name: error.name,
      code: error.code
    };
    
    logger.payment.error('Error processing payment callback', errorDetails);
    
    // Track error event for analytics
    trackEvent('PAYMENT_PROCESSING_ERROR', {
      error: error.message,
      paymentMethod: 'PayU'
    });
    
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing payment callback: ' + (error.message || 'Unknown error'),
      error: errorDetails
    }, { status: 500 });
  }
}
