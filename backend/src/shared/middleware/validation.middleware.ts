import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../errors/app-errors';

/**
 * Validation Middleware Factory
 * Creates middleware that validates request body against Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate and parse request body
      schema.parse(req.body);
      
      // Validation passed, continue to next middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract all validation error messages
        const messages = error.errors.map((err) => err.message);
        
        // Combine messages into single error
        next(new BadRequestError(messages.join(', ')));
      } else {
        // Unexpected error during validation
        next(new BadRequestError('Validation failed'));
      }
    }
  };
};