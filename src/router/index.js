import express from 'express';
import { healthRoutes } from '../modules/health/index.js';
import { imagesRoutes } from '../modules/images/index.js';
import { transformRoutes } from '../modules/transform/index.js';
import { foldersRoutes } from '../modules/folders/index.js';
import { authRoutes } from '../modules/auth/index.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/images', imagesRoutes);
router.use('/i', transformRoutes);
router.use('/folders', foldersRoutes);

export default router;
