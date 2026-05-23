import { Router } from 'express';
import { validateRequest } from '../../../shared/index.js';
import { createFolderSchema, deleteFolderSchema } from '../validations/folders.schema.js';
import { createFolder, listFolders, deleteFolder } from '../controllers/folders.controller.js';

const router = Router();

router.post('/create', validateRequest(createFolderSchema), createFolder);
router.get('/', listFolders);
router.post('/delete', validateRequest(deleteFolderSchema), deleteFolder);

export { router as foldersRoutes };
