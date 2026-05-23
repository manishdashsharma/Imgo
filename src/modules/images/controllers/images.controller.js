import { asyncHandler, httpResponse, httpError, responseMessage, logger } from '../../../shared/index.js';
import {
  uploadImageService,
  getImageService,
  listImagesService,
  deleteImageService,
} from '../services/images.service.js';

const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      const error = new Error('No file provided');
      error.statusCode = 400;
      throw error;
    }
    const result = await uploadImageService(req.file, req.body);
    logger.info('Image uploaded', { imageId: result.image._id, requestId: req.requestId });
    return httpResponse(req, res, 201, responseMessage.custom('Image uploaded successfully'), result);
  } catch (error) {
    logger.error('Image upload failed', { error: error.message, requestId: req.requestId, stack: error.stack });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

const getImage = asyncHandler(async (req, res) => {
  try {
    const result = await getImageService(req.params.imageId);
    return httpResponse(req, res, 200, responseMessage.custom('Image fetched'), result);
  } catch (error) {
    logger.error('Get image failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

const listImages = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { folder } = req.query;
    const result = await listImagesService({ folder, page, limit });
    return httpResponse(req, res, 200, responseMessage.custom('Images fetched'), result);
  } catch (error) {
    logger.error('List images failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

const deleteImage = asyncHandler(async (req, res) => {
  try {
    const result = await deleteImageService(req.body.imageId);
    logger.info('Image deleted', { imageId: req.body.imageId, requestId: req.requestId });
    return httpResponse(req, res, 200, responseMessage.custom('Image deleted'), result);
  } catch (error) {
    logger.error('Delete image failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

export { uploadImage, getImage, listImages, deleteImage };
