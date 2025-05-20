import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/services/mongodb/serverOrderService";
import { createPayUPaymentRequest } from "@/services/mongodb/serverPaymentService";
import { PaymentMethod, OrderStatus } from "@/models/Order";
import { logger } from "@/utils/logger";
import { connectToDatabase } from "@/lib/mongodb";

// Validate PayU configuration
const validatePayUConfig = () => {
  const requiredEnvVars = [
    { name: "PAYU_MERCHANT_KEY", fallback: "NEXT_PUBLIC_PAYU_MERCHANT_KEY" },
    { name: "PAYU_SALT", fallback: null }, // No fallback for salt - must be server-side
    { name: "PAYU_MERCHANT_ID", fallback: null },
  ];

  const missingVars = requiredEnvVars.filter(
    (varConfig) => !process.env[varConfig.name] && 
                   (!varConfig.fallback || !process.env[varConfig.fallback])
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required PayU configuration: ${missingVars.map(v => v.name).join(", ")}`
    );
  }

  return true;
};

/**
 * Initiate a PayU payment
 * This API route creates an order and initiates a PayU payment
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Connect to MongoDB first
  try {
    await connectToDatabase();
    logger.db.info("Connected to MongoDB for payment processing");
  } catch (dbError: any) {
    logger.db.error("MongoDB connection error", {
      error: dbError.message,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Database service is currently unavailable",
        error: dbError.message,
      },
      { status: 503 }
    );
  }

  // Validate PayU configuration
  try {
    validatePayUConfig();
  } catch (configError: any) {
    logger.payment.error("PayU configuration error", {
      error: configError.message,
    });

    // In development, we can continue with dummy values for testing
    if (process.env.NEXT_PUBLIC_PAYU_MODE !== "production") {
      logger.payment.warn("Using development fallbacks for PayU configuration");
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Payment service is currently unavailable",
          error: configError.message,
        },
        { status: 503 }
      );
    }
  }

  // Parse the request body
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON in request body",
      },
      { status: 400 }
    );
  }

  const { userId, items, shippingAddress, billingAddress, returnUrl } =
    requestData;

  // Validate required fields
  if (!userId || !items || !shippingAddress || !returnUrl) {
    logger.payment.warn("Missing required fields for payment initiation", {
      missingFields: [
        !userId ? "userId" : null,
        !items ? "items" : null,
        !shippingAddress ? "shippingAddress" : null,
        !returnUrl ? "returnUrl" : null,
      ].filter(Boolean),
    });

    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields for payment initiation",
      },
      { status: 400 }
    );
  }

  // Create a new order
  logger.payment.info("Creating order for payment", { userId });
  const order = await createOrder(
    userId,
    items,
    shippingAddress,
    billingAddress,
    PaymentMethod.PAYU
  );

  // Create PayU payment request
  logger.payment.info("Creating PayU payment request", { orderId: order.id });
  const paymentRequest = createPayUPaymentRequest(order, returnUrl);

  logger.payment.info("Successfully initiated PayU payment", {
    orderId: order.id,
    orderNumber: order.orderNumber,
  });

  // Return payment request data
  return NextResponse.json({
    success: true,
    message: "Payment initiated successfully",
    data: {
      order,
      paymentRequest,
      payuUrl: process.env.NEXT_PUBLIC_PAYU_URL,
    },
  });
}
