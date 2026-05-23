import { createHash } from 'crypto';
import sharp from 'sharp';
import ImageModel from '../../../models/image.model.js';
import { getStorageAdapter } from '../../../shared/services/adapter.js';
import { CacheManager } from '../../../config/redis.js';
import { verifySignedUrl } from '../../../shared/utils/signedUrl.js';

const cache = new CacheManager();

const buildParamHash = (params) => {
  const sorted = Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== null && v !== undefined && v !== false)
      .sort(([a], [b]) => a.localeCompare(b))
  );
  return createHash('md5').update(JSON.stringify(sorted)).digest('hex').slice(0, 12);
};

const applyTransforms = async (buffer, params, originalMimeType) => {
  const { w, h, format, q, fit, blur, grayscale } = params;

  let pipeline = sharp(buffer).withMetadata(false);

  if (w || h) { pipeline = pipeline.resize(w || null, h || null, { fit }); }
  if (grayscale) { pipeline = pipeline.grayscale(); }
  if (blur) { pipeline = pipeline.blur(blur); }

  const outputFormat = format || (originalMimeType.split('/')[1]) || 'webp';
  pipeline = pipeline.toFormat(outputFormat, { quality: q });

  const outputBuffer = await pipeline.toBuffer();
  return { buffer: outputBuffer, contentType: `image/${outputFormat}` };
};

const transformImageService = async (imageId, validatedParams, rawQuery = {}) => {
  const image = await ImageModel
    .findOne({ _id: imageId, isActive: true })
    .select('key mimeType visibility updatedAt')
    .lean();

  if (!image) {
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  if (image.visibility === 'private') {
    const valid = verifySignedUrl(imageId, rawQuery);
    if (!valid) {
      const error = new Error('Missing or invalid signed URL');
      error.statusCode = 403;
      throw error;
    }
  }

  const paramHash = buildParamHash(validatedParams);
  const cacheKey = `transform:${imageId}:${paramHash}`;
  const etag = `"${imageId}-${paramHash}"`;

  const cached = await cache.getBuffer(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true, etag };
  }

  const adapter = getStorageAdapter();
  const originalBuffer = await adapter.get(image.key);

  const { buffer, contentType }
    = await applyTransforms(originalBuffer, validatedParams, image.mimeType);

  cache.setBuffer(cacheKey, buffer, contentType, 86400);

  return { buffer, contentType, fromCache: false, etag, visibility: image.visibility };
};

export { transformImageService };
