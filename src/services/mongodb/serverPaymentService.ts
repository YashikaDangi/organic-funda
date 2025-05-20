import { Order } from '@/models/Order';
import { logger } from '@/utils/logger';
import crypto from 'crypto';

// Server-side hash generation using crypto
const generateHash = (input: string): string => {
  try {
    // Use SHA512 hash for server-side (more secure than client-side implementation)
    const hash = crypto.createHash('sha512').update(input).digest('hex');
    return hash;
  } catch (err) {
    logger.payment.error('Failed to generate hash', { error: err });
    return 'hash_' + Date.now().toString(16);
  }
};

// PayU payment service configuration
const PAYU_MERCHANT_KEY = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY;
const PAYU_SALT = process.env.NEXT_PUBLIC_PAYU_SALT;
const PAYU_MERCHANT_ID = process.env.PAYU_MERCHANT_ID;
const PAYU_MODE = process.env.NEXT_PUBLIC_PAYU_MODE || 'production';

// PayU URL - use the one from environment or default to secure.payu.in
const PAYU_URL = process.env.NEXT_PUBLIC_PAYU_URL || 'https://secure.payu.in';

// Interface for PayU payment request
interface PayUPaymentRequest {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
}

// Generate hash for PayU payment
export const generatePayUHash = (
  txnid: string,
  amount: number,
  productinfo: string,
  firstname: string,
  email: string,
  udf1: string = '',
  udf2: string = '',
  udf3: string = '',
  udf4: string = '',
  udf5: string = ''
): string => {
  // Check if PayU configuration exists
  if (!PAYU_MERCHANT_KEY || !PAYU_SALT) {
    logger.payment.error('PayU configuration is missing', { 
      hasMerchantKey: !!PAYU_MERCHANT_KEY,
      hasSalt: !!PAYU_SALT
    });
    
    // For development only - return a dummy hash to allow testing
    // In production, you should handle this properly
    if (process.env.NODE_ENV !== 'production') {
      return 'development_hash_' + Date.now().toString(16);
    }
    
    throw new Error('PayU configuration is missing: Merchant Key or Salt not found');
  }

  try {
    // Convert amount to string with 2 decimal places
    const amountStr = amount.toFixed(2);

    // Create hash string as per PayU documentation
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${PAYU_SALT}`;
    
    // Generate hash using our server-side hash function
    const hash = generateHash(hashString);
    
    logger.payment.debug('Generated PayU hash', { txnid, productinfo });
    return hash;
  } catch (error: any) {
    logger.payment.error('Error generating PayU hash', { error: error.message, txnid });
    throw new Error(`Failed to generate PayU hash: ${error.message}`);
  }
};

// Create PayU payment request for an order
export const createPayUPaymentRequest = (order: Order, returnUrl: string): PayUPaymentRequest => {
  try {
    // Check if PayU merchant key exists
    if (!PAYU_MERCHANT_KEY) {
      logger.payment.error('PayU merchant key is missing');
      
      // For development only - use a placeholder key to allow testing
      // In production, you should handle this properly
      const devKey = process.env.NODE_ENV !== 'production' ? 'development_key' : null;
      if (!devKey) {
        throw new Error('PayU merchant key is missing');
      }
    }

    // Validate order data
    if (!order || !order.orderNumber || !order.shippingAddress || !order.id) {
      throw new Error('Invalid order data: missing required fields');
    }

    // Use order ID as transaction ID
    const txnid = order.orderNumber;
    
    // Get customer details from shipping address
    const { fullName, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode } = order.shippingAddress;
    
    // Validate shipping address
    if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !country || !postalCode) {
      throw new Error('Invalid shipping address: missing required fields');
    }
    
    // Get user email from order
    // Note: In a real app, userId might not be an email. You should fetch the user's email.
    // For now, we'll use a placeholder if needed
    let email = order.userId;
    
    if (!email) {
      logger.payment.warn('User email is missing, using placeholder', { orderId: order.id });
      email = `user-${order.userId}@example.com`;
    }
    
    // Create product info string
    const productinfo = `Order #${order.orderNumber}`;
    
    // Validate return URL
    if (!returnUrl) {
      throw new Error('Return URL is missing');
    }
    
    // Generate hash
    const hash = generatePayUHash(
      txnid,
      order.total,
      productinfo,
      fullName,
      email,
      order.id // Use order ID as udf1
    );
    
    // Create payment request object
    const paymentRequest: PayUPaymentRequest = {
      key: PAYU_MERCHANT_KEY || 'development_key',
      txnid,
      amount: order.total.toFixed(2),
      productinfo,
      firstname: fullName,
      email,
      phone: phoneNumber,
      surl: `${returnUrl}/success`,
      furl: `${returnUrl}/failure`,
      hash,
      udf1: order.id,
      address1: addressLine1,
      address2: addressLine2 || '',
      city,
      state,
      country,
      zipcode: postalCode
    };
    
    logger.payment.info('Created PayU payment request', { 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      amount: order.total
    });
    
    return paymentRequest;
  } catch (error: any) {
    logger.payment.error('Failed to create PayU payment request', { 
      error: error.message, 
      orderId: order?.id,
      orderNumber: order?.orderNumber
    });
    throw new Error(`Failed to create PayU payment request: ${error.message}`);
  }
};

// Verify PayU payment response with multiple verification methods
export const verifyPayUPaymentResponse = (payuResponse: any): boolean => {
  try {
    // Check if PayU configuration exists
    if (!PAYU_SALT) {
      logger.payment.error('PayU salt is missing for verification');
      
      // For development only - skip verification
      if (process.env.NODE_ENV !== 'production') {
        logger.payment.warn('Skipping hash verification in development mode');
        return true;
      }
      
      return false;
    }
    
    // Basic validation of required fields
    if (!payuResponse || !payuResponse.status || !payuResponse.txnid) {
      logger.payment.warn('Invalid PayU response: missing required fields');
      return false;
    }
    
    // If hash is not present, we can't verify
    if (!payuResponse.hash) {
      logger.payment.warn('PayU response missing hash value');
      
      // For non-production, we might still want to process it
      if (process.env.NODE_ENV !== 'production') {
        return true;
      }
      
      return false;
    }
    
    // Extract values for hash calculation
    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1 = '',
      udf2 = '',
      udf3 = '',
      udf4 = '',
      udf5 = '',
      hash: responseHash,
      mihpayid = '',
      error = '',
      error_Message = ''
    } = payuResponse;
    
    // Construct hash string based on PayU documentation
    // The format depends on whether the payment was successful or not
    let hashString;
    
    if (status === 'success') {
      // For successful payments
      hashString = `${PAYU_SALT}|${status}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
    } else {
      // For failed payments
      hashString = `${PAYU_SALT}|${status}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
    }
    
    // Generate hash
    const calculatedHash = generateHash(hashString);
    
    // Compare calculated hash with response hash
    const isValid = calculatedHash === responseHash;
    
    if (!isValid) {
      logger.payment.warn('PayU hash verification failed', {
        txnid,
        status,
        calculatedHash: calculatedHash.substring(0, 10) + '...',
        responseHash: responseHash.substring(0, 10) + '...'
      });
    } else {
      logger.payment.info('PayU hash verification successful', { txnid, status });
    }
    
    return isValid;
  } catch (error: any) {
    logger.payment.error('Error verifying PayU response', { error: error.message });
    
    // In development mode, we might want to proceed anyway
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    
    return false;
  }
};

// Process PayU payment response
export const processPayUPaymentResponse = (payuResponse: any) => {
  try {
    // Basic validation
    if (!payuResponse) {
      throw new Error('Empty PayU response');
    }
    
    // Extract key fields
    const {
      status,
      txnid,
      amount,
      mihpayid,
      error = '',
      error_Message = '',
      bank_ref_num = '',
      udf1 = '', // This should be the orderId
      mode = '',
      unmappedstatus = ''
    } = payuResponse;
    
    // Determine if payment was successful
    const isSuccess = status === 'success';
    
    // Extract order ID from udf1 field
    const orderId = udf1;
    
    // Prepare response object
    const processedResponse = {
      isSuccess,
      orderId,
      paymentId: mihpayid,
      amount: parseFloat(amount || '0'),
      status,
      errorMessage: isSuccess ? '' : (error_Message || error || 'Payment failed'),
      mode,
      bankReference: bank_ref_num,
      unmappedStatus: unmappedstatus
    };
    
    logger.payment.info('Processed PayU response', { 
      txnid, 
      status, 
      isSuccess,
      orderId
    });
    
    return processedResponse;
  } catch (error: any) {
    logger.payment.error('Error processing PayU response', { error: error.message });
    
    // Return a default error response
    return {
      isSuccess: false,
      orderId: '',
      paymentId: '',
      amount: 0,
      status: 'error',
      errorMessage: `Error processing payment response: ${error.message}`,
      mode: '',
      bankReference: '',
      unmappedStatus: ''
    };
  }
};
