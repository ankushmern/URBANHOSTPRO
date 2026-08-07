import mongoose, { Schema, Document } from 'mongoose';

export interface IDish extends Document {
  dishId: string;
  title: string;
  category: 'Popular' | 'Trial' | 'North Indian' | 'South Indian' | 'Chinese' | 'Italian' | 'Desserts' | 'Maharashtrian' | 'Street Food' | 'Beverages' | string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  prepTime: string;
  serves: string;
  description: string;
  ingredients: string[];
  image: string;
  isVeg: boolean;
  isPopular: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<IDish>;
  restore(): Promise<IDish>;
}

const DishSchema = new Schema<IDish>(
  {
    dishId: {
      type: String,
      required: [true, 'Dish ID is required'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Dish title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    category: {
      type: String,
      enum: {
        values: [
          'Popular',
          'Trial',
          'North Indian',
          'South Indian',
          'Chinese',
          'Italian',
          'Desserts',
          'Maharashtrian',
          'Street Food',
          'Beverages',
        ],
        message: '{VALUE} is not a valid dish category',
      },
      default: 'Popular',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: [0, 'Reviews count cannot be negative'],
    },
    prepTime: {
      type: String,
      default: '30 mins',
      trim: true,
    },
    serves: {
      type: String,
      default: '2 Persons',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Dish description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    image: {
      type: String,
      required: [true, 'Dish image URL is required'],
      trim: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
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

DishSchema.index({ category: 1, isVeg: 1, isDeleted: 1 });
DishSchema.index({ isPopular: 1, rating: -1, isDeleted: 1 });
DishSchema.index({ isDeleted: 1, createdAt: -1 });
DishSchema.index({ title: 'text', description: 'text' });

// Soft delete method
DishSchema.methods.softDelete = async function (): Promise<IDish> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore method
DishSchema.methods.restore = async function (): Promise<IDish> {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

export const Dish = mongoose.model<IDish>('Dish', DishSchema);
