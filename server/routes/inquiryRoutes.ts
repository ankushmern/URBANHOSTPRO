import express from 'express';
import { createInquiry, getAllInquiries } from '../controllers/inquiryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createInquirySchema } from '../validators/inquiryValidator.js';

const router = express.Router();

router.route('/')
  .post(validateRequest(createInquirySchema), createInquiry)
  .get(protect, adminOnly, getAllInquiries);

export default router;
