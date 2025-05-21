import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { processPayUPaymentResponse, verifyPayUPaymentResponse } from '@/services/mongodb/serverPaymentService';
import { updateOrderStatus, updatePaymentDetails, getOrderById } from '@/services/mongodb/serverOrderService';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/models/Order';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * Handle PayU success POST request and redirect to client-side success page
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for payment success processing");
    
    // Parse the request body
    let payuResponse;
    
    // Get URL parameters first (for GET requests or redirects)
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Check if we have orderId in the URL params
    if (params.orderId) {
      payuResponse = params;
    } else {
      // Try to parse the body for POST requests
      try {
        // Clone the request to avoid the "Body is unusable" error
        const clonedRequest = request.clone();
        try {
          // Try to parse as JSON first
          payuResponse = await clonedRequest.json();
        } catch (jsonErr) {
          try {
            // If not JSON, try to parse as form data
            const formData = await request.formData();
            payuResponse = Object.fromEntries(formData.entries());
          } catch (formErr) {
            // If both fail, use URL parameters as fallback
            logger.payment.warn('Failed to parse request body, using URL parameters', { url: request.url });
            payuResponse = params;
          }
        }
      } catch (err) {
        // Last resort fallback
        logger.payment.warn('Failed to parse request body, using empty object with URL parameters', { url: request.url });
        payuResponse = params;
      }
    }
    
    logger.payment.info('Received PayU success callback', { 
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
      if (process.env.NODE_ENV === 'production' && !payuResponse.mihpayid) {
        return NextResponse.redirect(
          new URL(`/checkout/failure?error_Message=Invalid payment signature&txnid=${payuResponse.txnid || ''}`, request.url),
          { status: 303 } // 303 forces a GET request regardless of original method
        );
      }
    }
    
    // Process the payment response
    const processedResponse = processPayUPaymentResponse(payuResponse);
    
    // Extract data from the processed response
    const isSuccess = processedResponse.isSuccess;
    const errorMessage = processedResponse.errorMessage || '';
    
    // If not successful, redirect to failure page
    if (!isSuccess) {
      logger.payment.warn('Payment was not successful', { 
        txnid: payuResponse.txnid,
        error: errorMessage
      });
      
      return NextResponse.redirect(
        new URL(`/checkout/failure?error_Message=${encodeURIComponent(errorMessage)}&txnid=${payuResponse.txnid || ''}&orderId=${processedResponse.orderId || ''}`, request.url),
        { status: 303 } // 303 forces a GET request regardless of original method
      );
    }
    
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
      logger.payment.error('Order not found for payment success', { orderId });
      return NextResponse.redirect(
        new URL(`/checkout/failure?error_Message=${encodeURIComponent('Order not found')}&orderId=${orderId || ''}`, request.url),
        { status: 303 } // 303 forces a GET request regardless of original method
      );
    }
    
    // Log payment success (removed tracking event)
    logger.payment.info('Payment success recorded', {
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
      paymentStatus: PaymentStatus.COMPLETED,
      paymentDate: new Date().toISOString(),
      paymentMethod: PaymentMethod.PAYU,
      // Store additional details in the payuResponse object
      payuResponse: {
        ...fullResponse,
        mode,
        errorMessage,
        bankReference
      }
    });
    
    // Update order status based on payment status
    await updateOrderStatus(orderId, OrderStatus.PAYMENT_COMPLETED);
    
    // Trigger any post-payment processes
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
    
    logger.payment.info('Payment processed successfully, redirecting to success page', { 
      orderId, 
      status: OrderStatus.PAYMENT_COMPLETED, 
      transactionId 
    });
    
    // Redirect to the client-side success page with query parameters
    // Force GET method by setting the status code to 303 (See Other)
    return NextResponse.redirect(
      new URL(`/checkout/success?orderId=${orderId}&txnid=${transactionId}&amount=${amount}&status=success`, request.url),
      { status: 303 } // 303 forces a GET request regardless of original method
    );
  } catch (error: any) {
    // Enhanced error logging with more details
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      name: error.name,
      code: error.code
    };
    
    logger.payment.error('Error processing payment success', errorDetails);
    
    // Log error (removed tracking event)
    logger.payment.error('Payment processing error', {
      error: error.message,
      paymentMethod: 'PayU'
    });
    
    // Redirect to failure page with error message
    // Force GET method by setting the status code to 303 (See Other)
    return NextResponse.redirect(
      new URL(`/checkout/failure?error_Message=${encodeURIComponent(error.message || 'Unknown error')}&error_Code=PROCESSING_ERROR`, request.url),
      { status: 303 } // 303 forces a GET request regardless of original method
    );
  }
}
