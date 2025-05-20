import mongoose, { Schema, Document } from 'mongoose';

// Interface for Address document
export interface IAddress extends Document {
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Address
const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create a compound index for userId and isDefault to efficiently query default addresses
AddressSchema.index({ userId: 1, isDefault: 1 });

// Create the model if it doesn't exist already
const Address = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);

export default Address;
