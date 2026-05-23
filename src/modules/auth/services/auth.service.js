import crypto from 'crypto';
import { randomBytes } from 'crypto';
import ApiKeyModel from '../../../models/apiKey.model.js';

const generateApiKeyService = async ({ name }) => {
  const raw = `imgo_${randomBytes(32).toString('base64url')}`;
  const keyHash = crypto.createHash('sha256').update(raw).digest('hex');
  const keyPrefix = raw.slice(0, 12);

  const apiKey = await ApiKeyModel.create({ name, keyHash, keyPrefix });

  return {
    apiKey: {
      _id: apiKey._id,
      name: apiKey.name,
      key: raw,
      keyPrefix,
      createdAt: apiKey.createdAt,
    },
  };
};

const setupApiKeyService = async ({ name }) => {
  const count = await ApiKeyModel.countDocuments({ isActive: true });
  if (count > 0) {
    const error = new Error(
      'Setup already completed. Use POST /v1/auth/keys/create to add more keys.'
    );
    error.statusCode = 409;
    throw error;
  }
  return generateApiKeyService({ name });
};

const listApiKeysService = async () => {
  const keys = await ApiKeyModel
    .find({ isActive: true })
    .select('name keyPrefix lastUsedAt createdAt')
    .sort({ createdAt: -1 })
    .lean();
  return { keys };
};

const revokeApiKeyService = async (keyId) => {
  const key = await ApiKeyModel
    .findOne({ _id: keyId, isActive: true })
    .select('_id')
    .lean();

  if (!key) {
    const error = new Error('API key not found');
    error.statusCode = 404;
    throw error;
  }

  await ApiKeyModel.updateOne({ _id: keyId }, { isActive: false });
  return { revoked: true };
};

export { generateApiKeyService, setupApiKeyService, listApiKeysService, revokeApiKeyService };
