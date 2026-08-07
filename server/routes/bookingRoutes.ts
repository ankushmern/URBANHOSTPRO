import express from 'express';
import { createBooking, getAllBookings, getUserBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createBookingSchema, updateBookingStatusSchema } from '../validators/bookingValidator.js';

const router = express.Router();

router.route('/')
  .post(validateRequest(createBookingSchema), createBooking)
  .get(protect, adminOnly, getAllBookings);

router.get('/my', protect, getUserBookings);
router.patch('/:id/status', protect, adminOnly, validateRequest(updateBookingStatusSchema), updateBookingStatus);

export default router;
