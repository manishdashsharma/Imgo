import { z } from 'zod';

export const uploadImageSchema = z.object({
  folder: z.string().min(1).max(100).optional().default('default'),
  visibility: z.enum(['public', 'private']).optional().default('public'),
});

export const deleteImageSchema = z.object({
  imageId: z.string().min(1, 'imageId is required'),
});

export const signImageSchema = z.object({
  imageId: z.string().min(1, 'imageId is required'),
  expiresIn: z.coerce.number().int().min(60).max(604800).optional().default(3600),
  params: z.record(z.string(), z.union([z.string(), z.number()])).optional().default({}),
});
