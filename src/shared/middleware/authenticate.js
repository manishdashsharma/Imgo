import crypto from 'crypto';
import ApiKeyModel from '../../models/apiKey.model.js';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Missing or invalid Authorization header. Use: Bearer <api-key>',
      data: null,
    });
  }

  const raw = authHeader.slice(7);
  const keyHash = crypto.createHash('sha256').update(raw).digest('hex');

  const apiKey = await ApiKeyModel.findOne({ keyHash, isActive: true }).select('_id').lean();
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid or revoked API key',
      data: null,
    });
  }

  ApiKeyModel.updateOne({ _id: apiKey._id }, { lastUsedAt: new Date() })
    .catch((_err) => { /* fire and forget */ });

  req.apiKeyId = apiKey._id;
  return next();
};

export { authenticate };
