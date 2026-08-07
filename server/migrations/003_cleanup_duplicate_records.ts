import { User } from '../models/User';
import { Dish } from '../models/Dish';
import { MigrationScript } from './runner';

export const migration003: MigrationScript = {
  name: '003_cleanup_duplicate_records',
  up: async () => {
    // 1. Check duplicate phone numbers in User collection and resolve them by keeping the latest record
    const duplicateUsers = await User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$phone', ids: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const dup of duplicateUsers) {
      const idsToKeep = dup.ids.slice(dup.ids.length - 1);
      const idsToDelete = dup.ids.slice(0, dup.ids.length - 1);

      await User.updateMany(
        { _id: { $in: idsToDelete } },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );
    }

    // 2. Check duplicate dishIds in Dish collection
    const duplicateDishes = await Dish.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$dishId', ids: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const dup of duplicateDishes) {
      const idsToDelete = dup.ids.slice(0, dup.ids.length - 1);
      await Dish.updateMany(
        { _id: { $in: idsToDelete } },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );
    }
  },
};
