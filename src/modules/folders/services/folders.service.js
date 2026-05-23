import FolderModel from '../../../models/folder.model.js';
import ImageModel from '../../../models/image.model.js';

const createFolderService = async (body) => {
  const { name } = body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const existing = await FolderModel.findOne({ slug, isActive: true }).lean();
  if (existing) {
    const error = new Error('Folder with this name already exists');
    error.statusCode = 409;
    throw error;
  }

  const folder = await FolderModel.create({ name, slug });
  return { folder };
};

const listFoldersService = async ({ page, limit }) => {
  const filter = { isActive: true };
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    FolderModel.countDocuments(filter),
    FolderModel
      .find(filter)
      .select('name slug createdAt')
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

const deleteFolderService = async (folderId) => {
  const folder = await FolderModel
    .findOne({ _id: folderId, isActive: true })
    .select('slug')
    .lean();

  if (!folder) {
    const error = new Error('Folder not found');
    error.statusCode = 404;
    throw error;
  }

  const imageCount = await ImageModel.countDocuments({ folder: folder.slug, isActive: true });
  if (imageCount > 0) {
    const error = new Error(`Cannot delete — folder has ${imageCount} active image(s)`);
    error.statusCode = 400;
    throw error;
  }

  await FolderModel.updateOne({ _id: folderId }, { isActive: false });
  return { deleted: true };
};

export { createFolderService, listFoldersService, deleteFolderService };
