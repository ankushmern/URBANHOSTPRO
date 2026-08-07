import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: 'New' | 'Contacted' | 'Closed';
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<IInquiry>;
  restore(): Promise<IInquiry>;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s]{10,15}$/, 'Please provide a valid 10 to 15 digit phone number'],
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
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters long'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Closed'],
        message: '{VALUE} is not a valid inquiry status',
      },
      default: 'New',
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
  }
);

InquirySchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
InquirySchema.index({ phone: 1, isDeleted: 1 });
InquirySchema.index({ isDeleted: 1, createdAt: -1 });

// Soft delete method
InquirySchema.methods.softDelete = async function (): Promise<IInquiry> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore method
InquirySchema.methods.restore = async function (): Promise<IInquiry> {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

export const Inquiry = mongoose.model<IInquiry>('Inquiry', InquirySchema);
