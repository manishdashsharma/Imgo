import { checkHealth } from '../../../config/connections.js';
import { httpResponse, responseMessage, httpError, asyncHandler, logger } from '../../../shared/index.js';
import config from '../../../config/index.js';
import SystemStatus from '../../../models/system-staus.model.js';

const healthCheck = asyncHandler(async (req, res) => {
  return httpResponse(req, res, 200, responseMessage.SUCCESS.HEALTH_CHECK, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

const detailedHealthCheck = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const services = await checkHealth();

  const status = services.mongodb.connected ? 'healthy' : 'degraded';

  const data = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    responseTime: Date.now() - startTime,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    services,
  };

  if (status === 'degraded') {
    return res.status(503).json({ success: false, statusCode: 503, message: 'Service degraded', data });
  }

  return httpResponse(req, res, 200, responseMessage.SUCCESS.HEALTH_CHECK, data);
});

const readyCheck = asyncHandler(async (req, res) => {
  const services = await checkHealth();
  if (!services.mongodb.connected) {
    return httpError(req, res, new Error('Service not ready'), 503);
  }
  return httpResponse(req, res, 200, responseMessage.SUCCESS.READY, {
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

const liveCheck = asyncHandler(async (req, res) => {
  return httpResponse(req, res, 200, responseMessage.SUCCESS.ALIVE, {
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const fullSystemStatus = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  try {
    const services = await checkHealth();
    const status = services.mongodb.connected ? 'healthy' : 'unhealthy';

    const statusData = {
      timestamp: new Date().toISOString(),
      status,
      uptime: process.uptime(),
      environment: config.env,
      version: process.env.npm_package_version || '1.0.0',
      responseTime: Date.now() - startTime,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      services,
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    try {
      await SystemStatus.create({ ...statusData, requestId: req.requestId });
    } catch (dbError) {
      logger.error('Failed to save system status', { error: dbError.message });
    }

    return httpResponse(req, res, status === 'healthy' ? 200 : 503, `System ${status}`, statusData);
  } catch (error) {
    logger.error('System status check failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, new Error('Failed to retrieve system status'), 500);
  }
});

const getSystemStatus = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) { filter.status = req.query.status; }
    if (req.query.environment) { filter.environment = req.query.environment; }

    const [total, records] = await Promise.all([
      SystemStatus.countDocuments(filter),
      SystemStatus.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    ]);

    const offset = (page - 1) * limit;
    const fetchedCount = offset + records.length;

    return httpResponse(req, res, 200, 'Status records fetched', {
      items: records,
      pagination: { total, page, limit, hasNextPage: fetchedCount < total },
    });
  } catch (error) {
    logger.error('Get system status failed', { error: error.message, requestId: req.requestId });
    return httpError(req, res, new Error('Failed to retrieve status records'), 500);
  }
});

export {
  healthCheck, detailedHealthCheck, readyCheck,
  liveCheck, fullSystemStatus, getSystemStatus,
};
