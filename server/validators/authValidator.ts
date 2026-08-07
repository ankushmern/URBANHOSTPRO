import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone number required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Valid phone number required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Valid 10-digit mobile number required'),
    type: z.enum(['signup', 'login', 'reset', 'auth']).optional(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Valid phone number required'),
    code: z.string().length(6, 'OTP must be 6 digits'),
    name: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});
