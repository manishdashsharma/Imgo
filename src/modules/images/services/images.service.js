import path from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import ImageModel from '../../../models/image.model.js';
import { getStorageAdapter } from '../../../shared/services/adapter.js';
import { buildSignedUrl } from '../../../shared/utils/signedUrl.js';
import config from '../../../config/index.js';

const uploadImageService = async (file, body) => {
  const { folder = 'default', visibility = 'public' } = body;
  const ext = path.extname(file.originalname).replace('.', '') || 'jpg';
  const key = `${folder}/${randomUUID()}.${ext}`;

  const adapter = getStorageAdapter();
  const { url } = await adapter.upload(file.buffer, key, file.mimetype);

  const metadata = await sharp(file.buffer).metadata();

  const image = await ImageModel.create({
    key,
    url,
    folder,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    width: metadata.width || null,
    height: metadata.height || null,
    visibility,
  });

  return { image };
};

const getImageService = async (imageId) => {
  const image = await ImageModel
    .findOne({ _id: imageId, isActive: true })
    .select('key url folder originalName mimeType size width height createdAt')
    .lean();

  if (!image) {
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  return { image };
};

const listImagesService = async ({ folder, page, limit }) => {
  const filter = { isActive: true };
  if (folder) {filter.folder = folder;}

  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    ImageModel.countDocuments(filter),
    ImageModel
      .find(filter)
      .select('key url folder originalName mimeType size width height createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const offset = (page - 1) * limit;
  const fetchedCount = offset + items.length;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      hasNextPage: fetchedCount < total,
    },
  };
};

const deleteImageService = async (imageId) => {
  const image = await ImageModel
    .findOne({ _id: imageId, isActive: true })
    .select('key')
    .lean();

  if (!image) {
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  await ImageModel.updateOne({ _id: imageId }, { isActive: false });

  return { deleted: true };
};

const signImageUrlService = async ({ imageId, expiresIn, params }) => {
  if (!config.signedUrl.secret) {
    const error = new Error('SIGNED_URL_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }

  const image = await ImageModel
    .findOne({ _id: imageId, isActive: true })
    .select('_id visibility')
    .lean();

  if (!image) {
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  const signed = buildSignedUrl(imageId, params, expiresIn);
  const qs = Object.entries(signed)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  return { url: `/v1/i/${imageId}?${qs}` };
};

export {
  uploadImageService,
  getImageService,
  listImagesService,
  deleteImageService,
  signImageUrlService,
};
