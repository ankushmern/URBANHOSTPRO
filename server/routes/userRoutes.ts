import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { updateProfileSchema, userAddressSchema } from '../validators/userValidator.js';

const router = express.Router();

router.use(protect);

// Profile
router.get('/profile', getUserProfile);
router.put('/profile', validateRequest(updateProfileSchema), updateUserProfile);
router.post('/change-password', changePassword);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', validateRequest(userAddressSchema), addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Wishlist
router.post('/wishlist/toggle', toggleWishlist);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.patch('/notifications/read-all', markAllNotificationsRead);

export default router;
