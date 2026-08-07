import express from 'express';
import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
  getPaymentHistory,
  getAllPaymentsAdmin,
  getInvoiceDetails,
  issueRefund,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  createRazorpayOrderSchema,
  verifyPaymentSchema,
  requestRefundSchema,
} from '../validators/paymentValidator.js';

const router = express.Router();

// Public / Semi-Public Routes
router.post('/create-order', validateRequest(createRazorpayOrderSchema), createOrder);
router.post('/verify', validateRequest(verifyPaymentSchema), verifyPayment);
router.post('/webhook', razorpayWebhook);
router.get('/invoice/:paymentId', getInvoiceDetails);

// Protected User Routes
router.get('/history', protect, getPaymentHistory);

// Admin Routes
router.get('/all', protect, getAllPaymentsAdmin);
router.post('/refund', protect, validateRequest(requestRefundSchema), issueRefund);

export default router;
