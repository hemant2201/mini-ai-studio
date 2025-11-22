import { createApp } from './app';
import { config } from './shared/config/env';
import { logger } from './shared/utils/logger.util';

const startServer = (): void => {
  try {
    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 CORS enabled for: ${config.corsOrigin}`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
    });

    /**
     * SIGTERM handler
     * Sent by container orchestrators (Docker, Kubernetes)
     * when stopping container
     */
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    /**
     * SIGINT handler
     * Sent when developer presses Ctrl+C
     */
    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export { startServer };