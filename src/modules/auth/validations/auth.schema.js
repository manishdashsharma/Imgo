import { z } from 'zod';

export const setupSchema = z.object({
  name: z.string().min(1, 'name is required').max(100),
});

export const createKeySchema = z.object({
  name: z.string().min(1, 'name is required').max(100),
});

export const revokeKeySchema = z.object({
  keyId: z.string().min(1, 'keyId is required'),
});
