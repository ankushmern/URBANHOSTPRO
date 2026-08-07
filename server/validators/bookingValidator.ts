import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Valid 10-digit phone number is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    serviceType: z.string().optional().default('culinary'),
    serviceDetail: z.string().min(2, 'Service detail is required'),
    quantity: z.number().int().min(1).optional().default(1),
    date: z.string().min(1, 'Booking date is required'),
    time: z.string().optional().default('12:00 PM'),
    notes: z.string().optional().default(''),
    totalAmount: z.number().min(0).optional().default(0),
    utrNumber: z.string().optional().default(''),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Booking ID parameter required'),
  }),
  body: z.object({
    status: z.enum(['Pending', 'Payment Verification Pending', 'Confirmed', 'Completed', 'Cancelled']),
    assignedChef: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
    }).optional(),
  }),
});
