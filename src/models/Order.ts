import { Product } from "@/redux/slices/cartSlice";
import { Address } from "./Address";

export enum OrderStatus {
  CREATED = 'CREATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  PAYU = 'PAYU',
  COD = 'COD'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface PaymentDetails {
  paymentId?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  payuResponse?: any; // Store PayU response data
}

export interface Order {
  id?: string;
  userId: string;
  orderNumber: string;
  items: Product[];
  shippingAddress: Address;
  billingAddress?: Address;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentDetails: PaymentDetails;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
