import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';
import { MulterError } from 'multer';

import config from './config/index.js';
import { EStorageDriver } from './shared/index.js';
import { logger, errorHandler, notFoundHandler, httpResponse } from './shared/index.js';
import router from './router/index.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = config.cors.origins || ['http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

if (config.env !== 'test') {
  const limiter = rateLimit({
    windowMs: config.rateLimiting.windowMs,
    max: config.rateLimiting.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', { ip: req.ip });
      return httpResponse(req, res, 429, 'Too many requests, please try again later.');
    },
  });
  app.use(limiter);
}

app.use(compression());

app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, _res, next) => {
  req.requestId = randomUUID();
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Request-ID', req.requestId);
  const startTime = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startTime}ms`);
  });
  next();
});

if (config.storage.driver === EStorageDriver.LOCAL) {
  app.use('/storage', express.static(config.storage.localPath));
}

app.get('/', (req, res) => {
  return httpResponse(req, res, 200, 'Imgo is running', {
    name: 'Imgo',
    version: config.apiVersion,
    environment: config.env,
    storage: config.storage.driver,
    docs: {
      health: '/v1/health',
      images: '/v1/images',
      transform: '/v1/i/:imageId',
      folders: '/v1/folders',
    },
  });
});

app.use('/v1', router);

app.use((err, req, res, next) => {
  if (err instanceof MulterError) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.code === 'LIMIT_FILE_SIZE'
        ? `File too large. Maximum size is ${config.upload.maxFileSizeMb}MB`
        : err.message,
      data: null,
    });
  }
  if (err.message && err.message.startsWith('File type')) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message,
      data: null,
    });
  }
  return next(err);
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
