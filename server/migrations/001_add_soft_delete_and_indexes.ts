import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { Dish } from '../models/Dish';
import { Inquiry } from '../models/Inquiry';
import { AuditLog } from '../models/AuditLog';
import { MigrationScript } from './runner';

export const migration001: MigrationScript = {
  name: '001_add_soft_delete_and_indexes',
  up: async () => {
    const models: any[] = [User, Booking, Payment, Review, Dish, Inquiry, AuditLog];

    for (const model of models) {
      // 1. Set default isDeleted = false for any documents missing the field
      await model.updateMany(
        { isDeleted: { $exists: false } },
        { $set: { isDeleted: false, deletedAt: null } }
      );

      // 2. Ensure collection indexes are synced
      await model.syncIndexes();
    }
  },
};
