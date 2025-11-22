import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { SignupSchema, LoginSchema } from './dto';

/**
 * Auth Routes
 * Defines all authentication-related endpoints
 */
const router = Router();

router.post('/signup', validate(SignupSchema), authController.signup);

router.post('/login', validate(LoginSchema), authController.login);

router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;