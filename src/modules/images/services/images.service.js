import path from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import ImageModel from '../../../models/image.model.js';
import { getStorageAdapter } from '../../../storage/adapter.js';

const uploadImageService = async (file, body) => {
  const { folder = 'default' } = body;
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

export { uploadImageService, getImageService, listImagesService, deleteImageService };
