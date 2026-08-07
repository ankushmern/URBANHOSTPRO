import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional().or(z.literal('')),
    location: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export const userAddressSchema = z.object({
  body: z.object({
    title: z.enum(['Home', 'Work', 'Other']).default('Home'),
    flatNo: z.string().optional().default(''),
    addressLine: z.string().min(3, 'Address line is required'),
    landmark: z.string().optional().default(''),
    city: z.string().min(2, 'City is required'),
    pincode: z.string().min(4, 'Valid pincode required'),
    lat: z.number().optional().default(19.0760),
    lng: z.number().optional().default(72.8777),
    isDefault: z.boolean().optional().default(false),
  }),
});
