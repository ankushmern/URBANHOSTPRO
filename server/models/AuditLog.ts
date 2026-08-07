import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'USER_BAN'
  | 'USER_UNBAN'
  | 'USER_DELETE'
  | 'ROLE_CHANGE'
  | 'REFUND_APPROVED'
  | 'REFUND_REJECTED'
  | 'DISH_CREATE'
  | 'DISH_UPDATE'
  | 'DISH_DELETE'
  | 'BOOKING_UPDATE'
  | 'INQUIRY_RESOLVED'
  | 'BULK_DELETE_USERS'
  | 'EXPORT_CSV';

export interface IAuditLog extends Document {
  adminId?: string;
  adminEmail?: string;
  action: AuditAction;
  details: string;
  targetId?: string;
  ipAddress?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<IAuditLog>;
  restore(): Promise<IAuditLog>;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: String,
      default: 'admin_sys',
      trim: true,
      index: true,
    },
    adminEmail: {
      type: String,
      default: 'admin@cookmantra.com',
      trim: true,
      lowercase: true,
    },
    action: {
      type: String,
      required: [true, 'Audit log action type is required'],
      enum: {
        values: [
          'LOGIN',
          'LOGOUT',
          'USER_BAN',
          'USER_UNBAN',
          'USER_DELETE',
          'ROLE_CHANGE',
          'REFUND_APPROVED',
          'REFUND_REJECTED',
          'DISH_CREATE',
          'DISH_UPDATE',
          'DISH_DELETE',
          'BOOKING_UPDATE',
          'INQUIRY_RESOLVED',
          'BULK_DELETE_USERS',
          'EXPORT_CSV',
        ],
        message: '{VALUE} is not a supported audit action type',
      },
      index: true,
    },
    details: {
      type: String,
      required: [true, 'Audit log details are required'],
      trim: true,
    },
    targetId: {
      type: String,
      default: '',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
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
    toObject: { virtuals: true },
  }
);

AuditLogSchema.index({ adminId: 1, isDeleted: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, isDeleted: 1, createdAt: -1 });
AuditLogSchema.index({ isDeleted: 1, createdAt: -1 });

// Soft delete method
AuditLogSchema.methods.softDelete = async function (): Promise<IAuditLog> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Restore method
AuditLogSchema.methods.restore = async function (): Promise<IAuditLog> {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
