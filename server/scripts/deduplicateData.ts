import mongoose from 'mongoose';
import { User } from '../models/User';
import { Dish } from '../models/Dish';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { logger } from '../utils/logger';

export async function deduplicateDatabase(): Promise<{
  duplicateUsersRemoved: number;
  duplicateDishesRemoved: number;
  duplicatePaymentsRemoved: number;
  orphanReviewsCleaned: number;
}> {
  logger.info('Starting database deduplication and cleanup process...');

  let duplicateUsersRemoved = 0;
  let duplicateDishesRemoved = 0;
  let duplicatePaymentsRemoved = 0;
  let orphanReviewsCleaned = 0;

  // 1. Clean duplicate Users by phone number
  const dupUsers = await User.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$phone', ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  for (const group of dupUsers) {
    const idsToDelete = group.ids.slice(0, group.ids.length - 1);
    const res = await User.updateMany(
      { _id: { $in: idsToDelete } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    duplicateUsersRemoved += res.modifiedCount;
  }

  // 2. Clean duplicate Dishes by dishId
  const dupDishes = await Dish.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$dishId', ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  for (const group of dupDishes) {
    const idsToDelete = group.ids.slice(0, group.ids.length - 1);
    const res = await Dish.updateMany(
      { _id: { $in: idsToDelete } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    duplicateDishesRemoved += res.modifiedCount;
  }

  // 3. Clean duplicate Payments by paymentId
  const dupPayments = await Payment.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$paymentId', ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  for (const group of dupPayments) {
    const idsToDelete = group.ids.slice(0, group.ids.length - 1);
    const res = await Payment.updateMany(
      { _id: { $in: idsToDelete } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    duplicatePaymentsRemoved += res.modifiedCount;
  }

  // 4. Clean orphan Reviews where userId does not exist or user is deleted
  const reviews = await Review.find({ isDeleted: false });
  for (const rev of reviews) {
    if (rev.userId && mongoose.Types.ObjectId.isValid(rev.userId.toString())) {
      const user = await User.findOne({ _id: rev.userId, isDeleted: false });
      if (!user) {
        rev.isDeleted = true;
        rev.deletedAt = new Date();
        await rev.save();
        orphanReviewsCleaned++;
      }
    }
  }

  logger.info(
    `Deduplication completed. Users removed: ${duplicateUsersRemoved}, Dishes: ${duplicateDishesRemoved}, Payments: ${duplicatePaymentsRemoved}, Orphan Reviews: ${orphanReviewsCleaned}`
  );

  return {
    duplicateUsersRemoved,
    duplicateDishesRemoved,
    duplicatePaymentsRemoved,
    orphanReviewsCleaned,
  };
}
