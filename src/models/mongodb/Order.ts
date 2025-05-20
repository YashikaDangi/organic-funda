import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/models/Order';

// Interface for Order document
export interface IOrder extends Document {
  userId: string;
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: string; // Using OrderStatus enum values
  paymentDetails: {
    paymentId?: string;
    paymentMethod: string; // Using PaymentMethod enum values
    paymentStatus: string; // Using PaymentStatus enum values
    transactionId?: string;
    amount: number;
    currency: string;
    paymentDate?: Date;
    payuResponse?: any;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Order
const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    billingAddress: {
      fullName: { type: String },
      phoneNumber: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.CREATED,
    },
    paymentDetails: {
      paymentId: { type: String },
      paymentMethod: {
        type: String,
        required: true,
        enum: Object.values(PaymentMethod),
        default: PaymentMethod.PAYU,
      },
      paymentStatus: {
        type: String,
        required: true,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
      },
      transactionId: { type: String },
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: 'INR' },
      paymentDate: { type: Date },
      payuResponse: { type: Schema.Types.Mixed },
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Create indexes for efficient queries
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

// Create the model if it doesn't exist already
const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
