import 'dotenv/config';

import app from './app.js';
import config from './config/index.js';
import { logger } from './shared/index.js';
import { connectAll, disconnectAll } from './config/connections.js';

const PORT = config.port || 3000;

async function startServer() {
  try {
    logger.startup('Starting Imgo Server...');
    await connectAll();

    const server = app.listen(PORT, () => {
      logger.success(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.env} | Storage: ${config.storage.driver}`);
      logger.info(`Health: http://localhost:${PORT}/v1/health`);
    });

    app.set('server', server);

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error', { message: error.message });
      }
      process.exit(1);
    });

    const gracefulShutdown = async (signal) => {
      logger.warn(`Received ${signal}, shutting down...`);
      server.close(async () => {
        await disconnectAll();
        logger.success('Shutdown complete');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Shutdown timeout — forcing exit');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { message: error.message, stack: error.stack });
      process.exit(1);
    });
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', { reason: String(reason) });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { message: error.message });
    process.exit(1);
  }
}

startServer();
