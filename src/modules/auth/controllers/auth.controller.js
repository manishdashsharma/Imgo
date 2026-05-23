import { asyncHandler, httpResponse, httpError, responseMessage, logger } from '../../../shared/index.js';
import {
  setupApiKeyService,
  generateApiKeyService,
  listApiKeysService,
  revokeApiKeyService,
} from '../services/auth.service.js';

const setup = asyncHandler(async (req, res) => {
  try {
    const result = await setupApiKeyService(req.body);
    logger.info('First API key created via setup', { requestId: req.requestId });
    return httpResponse(req, res, 201, responseMessage.custom('Setup complete. Store this key — it will not be shown again.'), result);
  } catch (error) {
    logger.error('Setup failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

const createKey = asyncHandler(async (req, res) => {
  try {
    const result = await generateApiKeyService(req.body);
    logger.info('API key created', { name: req.body.name, requestId: req.requestId });
    return httpResponse(req, res, 201, responseMessage.custom('API key created. Store this key — it will not be shown again.'), result);
  } catch (error) {
    logger.error('Create key failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

const listKeys = asyncHandler(async (req, res) => {
  try {
    const result = await listApiKeysService();
    return httpResponse(req, res, 200, responseMessage.custom('API keys fetched'), result);
  } catch (error) {
    logger.error('List keys failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

const revokeKey = asyncHandler(async (req, res) => {
  try {
    const result = await revokeApiKeyService(req.body.keyId);
    logger.info('API key revoked', { keyId: req.body.keyId, requestId: req.requestId });
    return httpResponse(req, res, 200, responseMessage.custom('API key revoked'), result);
  } catch (error) {
    logger.error('Revoke key failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

export { setup, createKey, listKeys, revokeKey };
