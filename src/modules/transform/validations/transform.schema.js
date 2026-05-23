import { z } from 'zod';

export const transformQuerySchema = z.object({
  w: z.coerce.number().int().min(1).max(5000).optional(),
  h: z.coerce.number().int().min(1).max(5000).optional(),
  format: z.enum(['jpeg', 'png', 'webp', 'avif', 'gif']).optional(),
  q: z.coerce.number().int().min(1).max(100).optional().default(80),
  fit: z.enum(['cover', 'contain', 'fill', 'inside', 'outside']).optional().default('cover'),
  blur: z.coerce.number().min(0.3).max(1000).optional(),
  grayscale: z.string().transform((v) => v === 'true').optional(),
});
