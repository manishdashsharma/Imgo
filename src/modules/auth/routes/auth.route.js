import { Router } from 'express';
import { authenticate, validateRequest } from '../../../shared/index.js';
import { setupSchema, createKeySchema, revokeKeySchema } from '../validations/auth.schema.js';
import { setup, createKey, listKeys, revokeKey } from '../controllers/auth.controller.js';

const router = Router();

router.post('/setup', validateRequest(setupSchema), setup);
router.post('/keys/create', authenticate, validateRequest(createKeySchema), createKey);
router.get('/keys', authenticate, listKeys);
router.post('/keys/revoke', authenticate, validateRequest(revokeKeySchema), revokeKey);

export { router as authRoutes };
