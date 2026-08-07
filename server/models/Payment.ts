import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  orderId: string;
  userId?: mongoose.Types.ObjectId;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  amount: number; // in INR
  currency: 'INR' | 'USD' | string;
  status: 'Pending' | 'Success' | 'Failed' | 'Refunded';
  method: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'utr' | 'cash' | string;
  signature?: string;
  invoiceNumber: string;
  refundStatus: 'None' | 'Requested' | 'Processed' | 'Failed';
  refundId?: string;
  refundAmount?: number;
  utrNumber?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<IPayment>;
  restore(): Promise<IPayment>;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: [true, 'Payment ID is required'],
      unique: true,
      trim: true,
    },
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s]{10,15}$/, 'Please provide a valid 10 to 15 digit phone number'],
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative'],
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR',
      uppercase: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Success', 'Failed', 'Refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'Pending',
    },
    method: {
      type: String,
      enum: ['razorpay', 'upi', 'card', 'netbanking', 'utr', 'cash'],
      default: 'razorpay',
    },
    signature: {
      type: String,
      default: '',
      trim: true,
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
    },
    refundStatus: {
      type: String,
      enum: ['None', 'Requested', 'Processed', 'Failed'],
      default: 'None',
    },
    refundId: {
      type: String,
      default: '',
      trim: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative'],
    },
    utrNumber: {
      type: String,
      default: '',
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    bufferCommands: false,
  }
);

PaymentSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
PaymentSchema.index({ bookingId: 1, isDeleted: 1 });
PaymentSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
PaymentSchema.index({ isDeleted: 1, createdAt: -1 });

// Soft delete method
PaymentSchema.methods.softDelete = async function (): Promise<IPayment> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore method
PaymentSchema.methods.restore = async function (): Promise<IPayment> {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
