import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import { authenticate, validateRequest } from '../../../shared/index.js';
import { uploadImageSchema, deleteImageSchema, signImageSchema } from '../validations/images.schema.js';
import {
  uploadImage,
  getImage,
  listImages,
  deleteImage,
  signImageUrl,
} from '../controllers/images.controller.js';
import config from '../../../config/index.js';

const router = Router();

const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: config.upload.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

router.post('/upload', authenticate, upload.single('image'), validateRequest(uploadImageSchema), uploadImage);
router.get('/', authenticate, listImages);
router.get('/:imageId', authenticate, getImage);
router.post('/sign', authenticate, validateRequest(signImageSchema), signImageUrl);
router.post('/delete', authenticate, validateRequest(deleteImageSchema), deleteImage);

export { router as imagesRoutes };
