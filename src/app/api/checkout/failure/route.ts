import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { processPayUPaymentResponse, verifyPayUPaymentResponse } from '@/services/mongodb/serverPaymentService';
import { updateOrderStatus, updatePaymentDetails, getOrderById } from '@/services/mongodb/serverOrderService';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/models/Order';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * Handle PayU failure POST request and redirect to client-side failure page
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for payment failure processing");
    
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
    
    logger.payment.info('Received PayU failure callback', { 
      txnid: payuResponse.txnid,
      status: payuResponse.status,
      error_Message: payuResponse.error_Message
    });
    
    // Verify the payment response
    const isValid = verifyPayUPaymentResponse(payuResponse);
    
    if (!isValid) {
      logger.payment.warn('PayU response hash verification failed', { 
        txnid: payuResponse.txnid,
        status: payuResponse.status
      });
      // Continue processing anyway for failure case
    }
    
    // Process the payment response
    const processedResponse = processPayUPaymentResponse(payuResponse);
    
    // Extract data from the processed response
    const orderId = processedResponse.orderId;
    const errorMessage = processedResponse.errorMessage || payuResponse.error_Message || 'Payment failed';
    const errorCode = payuResponse.error_Code || '';
    const txnid = payuResponse.txnid || '';
    
    // Get the order if orderId is available
    let order = null;
    if (orderId) {
      try {
        order = await getOrderById(orderId);
        
        if (order) {
          // Update payment details with failure information
          await updatePaymentDetails(orderId, {
            transactionId: txnid,
            paymentStatus: PaymentStatus.FAILED,
            paymentDate: new Date().toISOString(),
            paymentMethod: PaymentMethod.PAYU,
            payuResponse: {
              ...payuResponse,
              errorMessage,
              errorCode
            }
          });
          
          // Update order status to payment failed
          await updateOrderStatus(orderId, OrderStatus.PAYMENT_FAILED);
          
          // Log payment failure (removed tracking event)
          logger.payment.info('Payment failure recorded', {
            orderId,
            orderNumber: order.orderNumber,
            error: errorMessage,
            paymentMethod: 'PayU',
            transactionId: txnid
          });
          
          logger.payment.info('Payment failure processed', { 
            orderId, 
            status: OrderStatus.PAYMENT_FAILED, 
            error: errorMessage 
          });
        } else {
          logger.payment.error('Order not found for payment failure', { orderId });
        }
      } catch (err: any) {
        logger.payment.error('Error processing order for payment failure', { 
          error: err.message,
          orderId
        });
      }
    }
    
    // Redirect to the client-side failure page with query parameters
    // Force GET method by setting the status code to 303 (See Other)
    return NextResponse.redirect(
      new URL(`/checkout/failure?orderId=${orderId || ''}&txnid=${txnid}&error_Message=${encodeURIComponent(errorMessage)}&error_Code=${errorCode}`, request.url),
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
    
    logger.payment.error('Error processing payment failure', errorDetails);
    
    // Log error (removed tracking event)
    logger.payment.error('Payment processing error', {
      error: error.message,
      paymentMethod: 'PayU'
    });
    
    // Redirect to failure page with error message
    return NextResponse.redirect(
      new URL(`/checkout/failure?error_Message=${encodeURIComponent(error.message || 'Unknown error')}&error_Code=PROCESSING_ERROR`, request.url)
    );
  }
}
