import { z } from 'zod';

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    amount: z.number().min(1, 'Amount must be greater than 0'),
    currency: z.string().optional().default('INR'),
    bookingId: z.string().min(1, 'Booking ID is required'),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    paymentId: z.string().min(1, 'Payment ID is required'),
    razorpaySignature: z.string().optional().default(''),
    bookingId: z.string().min(1, 'Booking ID is required'),
    method: z.string().optional().default('razorpay'),
    utrNumber: z.string().optional().default(''),
    status: z.string().optional().default('Success'),
  }),
});

export const requestRefundSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    reason: z.string().optional().default('Customer cancellation request'),
  }),
});

export const manualUtrSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    utrNumber: z.string().min(4, 'Valid UTR/Transaction number required'),
    amount: z.number().min(1, 'Amount must be greater than 0'),
  }),
});
