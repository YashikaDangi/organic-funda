import mongoose, { Schema, Document } from 'mongoose';

// Interface for Product in Cart
export interface ICartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Interface for Cart document
export interface ICart extends Document {
  userId: string;
  items: ICartProduct[];
  updatedAt: Date;
  lastSyncedFrom: string;
  syncTimestamp: number;
}

// Schema for Product in Cart
const CartProductSchema = new Schema<ICartProduct>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
}, { _id: false });

// Schema for Cart
const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [CartProductSchema], default: [] },
    lastSyncedFrom: { type: String, default: 'web-client' },
    syncTimestamp: { type: Number, default: () => Date.now() }
  },
  { timestamps: true }
);

// Create the model if it doesn't exist already
const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
