import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const deleteFolderSchema = z.object({
  folderId: z.string().min(1, 'folderId is required'),
});
