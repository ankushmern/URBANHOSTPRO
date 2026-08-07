import { z } from 'zod';

export const createInquirySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Valid 10-digit phone required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    message: z.string().min(5, 'Message must be at least 5 characters'),
  }),
});
