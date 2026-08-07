import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating max is 5'),
    comment: z.string().min(3, 'Review comment must be at least 3 characters'),
    dishId: z.string().optional().default(''),
    dishName: z.string().optional().default('General Chef Service'),
    chefId: z.string().optional().default(''),
  }),
});
