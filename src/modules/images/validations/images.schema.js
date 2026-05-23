import { z } from 'zod';

export const uploadImageSchema = z.object({
  folder: z.string().min(1).max(100).optional().default('default'),
});

export const deleteImageSchema = z.object({
  imageId: z.string().min(1, 'imageId is required'),
});
