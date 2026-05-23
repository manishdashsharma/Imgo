import { asyncHandler, httpResponse, httpError, responseMessage, logger } from '../../../shared/index.js';
import { createFolderService, listFoldersService, deleteFolderService } from '../services/folders.service.js';

const createFolder = asyncHandler(async (req, res) => {
  try {
    const result = await createFolderService(req.body);
    logger.info('Folder created', { folderId: result.folder._id, requestId: req.requestId });
    return httpResponse(req, res, 201, responseMessage.custom('Folder created successfully'), result);
  } catch (error) {
    logger.error('Create folder failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

const listFolders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await listFoldersService({ page, limit });
    return httpResponse(req, res, 200, responseMessage.custom('Folders fetched'), result);
  } catch (error) {
    logger.error('List folders failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

const deleteFolder = asyncHandler(async (req, res) => {
  try {
    const result = await deleteFolderService(req.body.folderId);
    logger.info('Folder deleted', { folderId: req.body.folderId, requestId: req.requestId });
    return httpResponse(req, res, 200, responseMessage.custom('Folder deleted'), result);
  } catch (error) {
    logger.error('Delete folder failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, error, error.statusCode || 500);
  }
});

export { createFolder, listFolders, deleteFolder };
