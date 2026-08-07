import express from 'express';
import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  refreshToken,
  logoutUser,
  logoutAllDevices,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getCsrfToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  signupSchema,
  signinSchema,
  sendOtpSchema,
  verifyOtpSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

const router = express.Router();

// Public Auth Endpoints
router.get('/csrf-token', getCsrfToken);
router.post('/register', validateRequest(signupSchema), registerUser);
router.post('/login', validateRequest(signinSchema), loginUser);
router.post('/send-otp', validateRequest(sendOtpSchema), sendOTP);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);

// Protected Auth Endpoints
router.post('/logout-all', protect, logoutAllDevices);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, validateRequest(changePasswordSchema), changePassword);

export default router;
