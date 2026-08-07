import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignedChef {
  name: string;
  phone: string;
  chefId?: mongoose.Types.ObjectId | string;
}

export interface IBooking extends Document {
  bookingId: string;
  userId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  serviceType: 'culinary' | 'cleaning' | 'combo' | 'catering' | 'daily_cook';
  serviceDetail: string;
  quantity: number;
  date: string;
  time: string;
  notes?: string;
  status: 'Pending' | 'Payment Verification Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  utrNumber?: string;
  assignedChef?: IAssignedChef;
  totalAmount: number;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<IBooking>;
  restore(): Promise<IBooking>;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s]{10,20}$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      default: '',
    },
    serviceType: {
      type: String,
      enum: {
        values: ['culinary', 'cleaning', 'combo', 'catering', 'daily_cook'],
        message: '{VALUE} is not a recognized service type',
      },
      default: 'culinary',
    },
    serviceDetail: {
      type: String,
      required: [true, 'Service details are required'],
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    date: {
      type: String,
      required: [true, 'Booking date is required'],
      trim: true,
    },
    time: {
      type: String,
      default: '12:00 PM',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Payment Verification Pending', 'Confirmed', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'Confirmed',
    },
    utrNumber: {
      type: String,
      default: '',
      trim: true,
    },
    assignedChef: {
      name: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      chefId: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
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
    toObject: { virtuals: true },
    bufferCommands: false,
  }
);

BookingSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
BookingSchema.index({ phone: 1, isDeleted: 1, status: 1 });
BookingSchema.index({ date: 1, isDeleted: 1 });
BookingSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
BookingSchema.index({ isDeleted: 1, createdAt: -1 });

// Soft delete method
BookingSchema.methods.softDelete = async function (): Promise<IBooking> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore method
BookingSchema.methods.restore = async function (): Promise<IBooking> {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
