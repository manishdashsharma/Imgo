import Redis from 'ioredis';
import config from './index.js';
import logger from '../shared/utils/logger.js';

let redisClient = null;
let redisAvailable = false;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
      logger.success('Redis connected');
    });

    redisClient.on('error', () => {
      redisAvailable = false;
    });

    redisClient.on('close', () => {
      redisAvailable = false;
    });
  }
  return redisClient;
};

const connectRedis = async () => {
  const client = getRedisClient();
  await client.connect();
  redisAvailable = true;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    redisAvailable = false;
    logger.info('Redis disconnected');
  }
};

const isRedisAvailable = () => redisAvailable;

class CacheManager {
  constructor() {
    this.client = getRedisClient();
  }

  async set(key, data, ttl) {
    if (!isRedisAvailable()) { return; }
    try {
      await this.client.setex(key, ttl, JSON.stringify(data));
    } catch {
      redisAvailable = false;
    }
  }

  async get(key) {
    if (!isRedisAvailable()) { return null; }
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      redisAvailable = false;
      return null;
    }
  }

  async del(key) {
    if (!isRedisAvailable()) { return; }
    try {
      await this.client.del(key);
    } catch {
      redisAvailable = false;
    }
  }

  async setBuffer(key, buffer, contentType, ttl = 86400) {
    if (!isRedisAvailable()) { return; }
    try {
      const payload = JSON.stringify({ b: buffer.toString('base64'), ct: contentType });
      await this.client.setex(key, ttl, payload);
    } catch {
      redisAvailable = false;
    }
  }

  async getBuffer(key) {
    if (!isRedisAvailable()) { return null; }
    try {
      const data = await this.client.get(key);
      if (!data) { return null; }
      const parsed = JSON.parse(data);
      return { buffer: Buffer.from(parsed.b, 'base64'), contentType: parsed.ct };
    } catch {
      redisAvailable = false;
      return null;
    }
  }
}

export { getRedisClient, connectRedis, disconnectRedis, isRedisAvailable, CacheManager };
