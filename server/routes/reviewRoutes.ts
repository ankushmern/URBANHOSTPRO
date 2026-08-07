import express from 'express';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createReviewSchema } from '../validators/reviewValidator.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', protect, validateRequest(createReviewSchema), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
