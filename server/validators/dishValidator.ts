import { z } from 'zod';

export const createDishSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Dish title is required'),
    category: z.string().min(1, 'Category is required'),
    price: z.number().min(0, 'Price must be non-negative'),
    originalPrice: z.number().min(0).optional(),
    description: z.string().min(5, 'Description is required'),
    ingredients: z.array(z.string()).optional().default([]),
    image: z.string().min(1, 'Dish image URL is required'),
    isVeg: z.boolean().optional().default(true),
    isPopular: z.boolean().optional().default(false),
    prepTime: z.string().optional().default('30 mins'),
    serves: z.string().optional().default('2 Persons'),
  }),
});

export const updateDishSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Dish ID is required'),
  }),
  body: z.object({
    title: z.string().min(2).optional(),
    category: z.string().optional(),
    price: z.number().min(0).optional(),
    originalPrice: z.number().min(0).optional(),
    description: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
    image: z.string().optional(),
    isVeg: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    prepTime: z.string().optional(),
    serves: z.string().optional(),
  }),
});
