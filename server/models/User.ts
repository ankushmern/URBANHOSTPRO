import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  _id?: string;
  id?: string;
  title: 'Home' | 'Work' | 'Other';
  flatNo?: string;
  addressLine: string;
  landmark?: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotification {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'refund' | 'otp' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  password?: string;
  role: 'user' | 'admin';
  avatar?: string;
  isBanned: boolean;
  status: 'active' | 'banned';
  location?: string;
  wishlist: string[];
  addresses: IAddress[];
  notifications: INotification[];
  totalBookings: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailOTP?: { code: string; expiresAt: Date; lastSentAt?: Date };
  phoneOTP?: { code: string; expiresAt: Date; lastSentAt?: Date };
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  refreshTokens: string[];
  loginAttempts: number;
  lockUntil?: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  softDelete(): Promise<IUser>;
  restore(): Promise<IUser>;
}

const AddressSchema = new Schema<IAddress>(
  {
    title: {
      type: String,
      enum: {
        values: ['Home', 'Work', 'Other'],
        message: '{VALUE} is not a valid address type',
      },
      default: 'Home',
    },
    flatNo: { type: String, default: '', trim: true },
    addressLine: {
      type: String,
      required: [true, 'Address line is required'],
      trim: true,
      minlength: [5, 'Address line must be at least 5 characters long'],
    },
    landmark: { type: String, default: '', trim: true },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit Indian postal code'],
    },
    lat: { type: Number, default: 19.076 },
    lng: { type: Number, default: 72.8777 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: [true, 'Notification title is required'], trim: true },
    message: { type: String, required: [true, 'Notification message is required'], trim: true },
    type: {
      type: String,
      enum: ['booking', 'payment', 'refund', 'otp', 'system'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '', trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[0-9+\-\s]{10,15}$/, 'Please provide a valid 10 to 15 digit phone number'],
    },
    password: {
      type: String,
      select: false,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin',
      },
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: 'Maharashtra, India',
      trim: true,
    },
    wishlist: [
      {
        type: String,
        ref: 'Dish',
      },
    ],
    addresses: [AddressSchema],
    notifications: [NotificationSchema],
    totalBookings: {
      type: Number,
      default: 0,
      min: [0, 'Total bookings count cannot be negative'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: true,
    },
    emailOTP: {
      code: { type: String, trim: true },
      expiresAt: Date,
      lastSentAt: Date,
    },
    phoneOTP: {
      code: { type: String, trim: true },
      expiresAt: Date,
      lastSentAt: Date,
    },
    resetPasswordToken: { type: String, trim: true },
    resetPasswordExpire: Date,
    refreshTokens: {
      type: [String],
      default: [],
    },
    loginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lockUntil: Date,
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

// Indexes for high performance queries
UserSchema.index({ email: 1 }, { sparse: true });
UserSchema.index({ role: 1, status: 1, isDeleted: 1 });
UserSchema.index({ isDeleted: 1, createdAt: -1 });

// Synchronize status and isBanned before save
UserSchema.pre('save', async function (this: IUser) {
  if (this.isModified('status')) {
    this.isBanned = this.status === 'banned';
  } else if (this.isModified('isBanned')) {
    this.status = this.isBanned ? 'banned' : 'active';
  }

  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Soft delete method
UserSchema.methods.softDelete = async function (): Promise<IUser> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore method
UserSchema.methods.restore = async function (): Promise<IUser> {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

export const User = mongoose.model<IUser>('User', UserSchema);
