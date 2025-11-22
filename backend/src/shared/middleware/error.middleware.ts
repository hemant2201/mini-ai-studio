import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-errors';
import { logger } from '../utils/logger.util';

/**
 * Error Handler Middleware
 * Centralized error handling for the entire application
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log all errors for debugging
  logger.error('Error occurred', err, {
    method: req.method,
    path: req.path,
    body: req.body,
  });

  // Handle operational errors (expected errors)
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle unexpected errors (programming errors)
  console.error('UNEXPECTED ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

/**
 * Not Found Handler Middleware
 * Handles requests to undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
  });
};