import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId | string;
  userName: string;
  userAvatar?: string;
  dishId?: string;
  dishName?: string;
  chefId?: string;
  rating: number;
  comment: string;
  isVerifiedCustomer: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<IReview>;
  restore(): Promise<IReview>;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    userAvatar: {
      type: String,
      default: '',
      trim: true,
    },
    dishId: {
      type: String,
      ref: 'Dish',
      default: '',
      trim: true,
    },
    dishName: {
      type: String,
      default: 'General Chef Service',
      trim: true,
    },
    chefId: {
      type: String,
      ref: 'User',
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [3, 'Review comment must be at least 3 characters'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    isVerifiedCustomer: {
      type: Boolean,
      default: true,
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

ReviewSchema.index({ dishId: 1, isDeleted: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
ReviewSchema.index({ chefId: 1, isDeleted: 1, createdAt: -1 });
ReviewSchema.index({ rating: -1, isDeleted: 1 });
ReviewSchema.index({ isDeleted: 1, createdAt: -1 });

// Soft delete method
ReviewSchema.methods.softDelete = async function (): Promise<IReview> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore method
ReviewSchema.methods.restore = async function (): Promise<IReview> {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
