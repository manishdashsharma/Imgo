import { asyncHandler, logger } from '../../../shared/index.js';
import { transformImageService } from '../services/transform.service.js';
import { transformQuerySchema } from '../validations/transform.schema.js';

const serveImage = asyncHandler(async (req, res) => {
  try {
    const parsed = transformQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: parsed.error.issues[0].message,
        data: null,
      });
    }

    const { imageId } = req.params;
    const { buffer, contentType, fromCache, etag }
      = await transformImageService(imageId, parsed.data, req.query);

    const clientEtag = req.headers['if-none-match'];
    if (clientEtag && clientEtag === etag) {
      return res.status(304).end();
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('ETag', etag);
    res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
    res.setHeader('X-Request-ID', req.requestId);
    return res.send(buffer);
  } catch (error) {
    logger.error('Transform failed', {
      error: error.message,
      imageId: req.params.imageId,
      requestId: req.requestId,
    });
    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message,
      data: null,
    });
  }
});

export { serveImage };
