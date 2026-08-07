import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID parameter required'),
  }),
  body: z.object({
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['active', 'banned']).optional(),
    isBanned: z.boolean().optional(),
  }),
});

export const bulkDeleteUsersSchema = z.object({
  body: z.object({
    userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
  }),
});
