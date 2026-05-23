import { Router } from 'express';
import { serveImage } from '../controllers/transform.controller.js';

const router = Router();

router.get('/:imageId', serveImage);

export { router as transformRoutes };
