import { Request, Response, NextFunction } from 'express';
import { jwtUtil } from '../utils/jwt.util';
import { UnauthorizedError } from '../errors/app-errors';


declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Validates JWT token and attaches userId to request
 */
export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwtUtil.verifyToken(token);
    
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};