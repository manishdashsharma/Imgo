import fs from 'fs/promises';
import mongoose from 'mongoose';
import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import config from './index.js';
import { EStorageDriver, logger } from '../shared/index.js';
import { connectRedis, disconnectRedis, getRedisClient } from './redis.js';

async function connectAll() {
  logger.info('Connecting to services...');

  await mongoose.connect(config.mongodb.url, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  logger.success('MongoDB connected');

  try {
    await connectRedis();
  } catch (redisError) {
    logger.warn(`Redis unavailable — transform cache disabled: ${redisError.message}`);
  }

  if (config.storage.driver === EStorageDriver.LOCAL) {
    await fs.mkdir(config.storage.localPath, { recursive: true });
    logger.success(`Local storage ready at ${config.storage.localPath}`);
  }

  if (config.storage.driver === EStorageDriver.MINIO) {
    await ensureMinIOBucket();
  }
}

async function disconnectAll() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  }
  await disconnectRedis();
  logger.info('All services disconnected');
}

function getMongoose() {
  return mongoose;
}

async function checkHealth() {
  const health = {
    mongodb: { connected: false, latency: null },
    redis: { connected: false, latency: null },
    storage: { driver: config.storage.driver },
    errors: [],
  };

  try {
    const mongoStart = Date.now();
    await mongoose.connection.db.admin().ping();
    health.mongodb.connected = true;
    health.mongodb.latency = Date.now() - mongoStart;
  } catch (error) {
    health.errors.push(`MongoDB: ${error.message}`);
  }

  try {
    const redis = getRedisClient();
    const redisStart = Date.now();
    await redis.ping();
    health.redis.connected = true;
    health.redis.latency = Date.now() - redisStart;
  } catch (error) {
    health.errors.push(`Redis: ${error.message}`);
  }

  return health;
}

async function ensureMinIOBucket() {
  const client = new S3Client({
    endpoint: config.minio.endpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId: config.minio.accessKey,
      secretAccessKey: config.minio.secretKey,
    },
    forcePathStyle: true,
  });

  try {
    await client.send(new HeadBucketCommand({ Bucket: config.minio.bucket }));
    logger.success(`MinIO bucket '${config.minio.bucket}' ready`);
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: config.minio.bucket }));
    logger.success(`MinIO bucket '${config.minio.bucket}' created`);
  }
}

export { connectAll, disconnectAll, getMongoose, checkHealth };
