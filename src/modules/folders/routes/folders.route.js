import { Router } from 'express';
import { authenticate, validateRequest } from '../../../shared/index.js';
import { createFolderSchema, deleteFolderSchema } from '../validations/folders.schema.js';
import { createFolder, listFolders, deleteFolder } from '../controllers/folders.controller.js';

const router = Router();

router.post('/create', authenticate, validateRequest(createFolderSchema), createFolder);
router.get('/', authenticate, listFolders);
router.post('/delete', authenticate, validateRequest(deleteFolderSchema), deleteFolder);

export { router as foldersRoutes };
