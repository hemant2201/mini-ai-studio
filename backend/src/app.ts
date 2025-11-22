import express, { Application } from 'express';
import cors from 'cors';
import { config } from './shared/config/env';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import { logger } from './shared/utils/logger.util';

export const createApp = (): Application => {
  const app = express();
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });
  app.use('/api/auth', authRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};