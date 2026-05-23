import { Router } from 'express';
import {
  healthCheck,
  detailedHealthCheck,
  readyCheck,
  liveCheck,
  fullSystemStatus,
  getSystemStatus,
} from '../controllers/health.controller.js';

const router = Router();

router.get('/', healthCheck);
router.get('/detailed', detailedHealthCheck);
router.get('/ready', readyCheck);
router.get('/live', liveCheck);
router.get('/system', fullSystemStatus);
router.get('/status', getSystemStatus);

export { router as healthRoutes };
