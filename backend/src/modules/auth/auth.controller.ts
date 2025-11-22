import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { logger } from '../../shared/utils/logger.util';

/**
 * Authentication Controller Class
 * Handles HTTP requests for authentication endpoints
 */
export class AuthController {
  private static instance: AuthController;
  private controllerLogger = logger;

  private constructor() {
    this.controllerLogger = logger;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  /**
   * POST /api/auth/signup
   * Register new user account
   */
  public signup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await authService.signup(req.body);

      this.controllerLogger.info('Signup successful', {
        userId: result.user.id,
      });

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/login
   * Authenticate existing user
   */
  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await authService.login(req.body);

      this.controllerLogger.info('Login successful', {
        userId: result.user.id,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  public getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // req.userId set by auth middleware
      const user = await authService.getUserById(req.userId!);

      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Export singleton instance for use in routes
 */
export const authController = AuthController.getInstance();