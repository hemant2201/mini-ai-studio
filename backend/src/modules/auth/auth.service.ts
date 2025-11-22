import { PrismaClient, User } from '@prisma/client';
import { SignupDto, LoginDto } from './dto';
import { passwordUtil } from '../../shared/utils/password.util';
import { jwtUtil } from '../../shared/utils/jwt.util';
import { ConflictError, UnauthorizedError } from '../../shared/errors/app-errors';
import { logger } from '../../shared/utils/logger.util';

/**
 * Auth Service Response Interface
 * Standard response format for authentication operations
 */
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
}

/**
 * Authentication Service Class
 * Handles all authentication-related business logic
 */
export class AuthService {
  private static instance: AuthService;
  private prisma: PrismaClient;
  private serviceLogger = logger;

  private constructor() {
    this.prisma = new PrismaClient();
    this.serviceLogger = logger;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * User Signup - Create new user account
   * @param data - Signup data (email, password)
   * @returns Auth response with token and user
   * @throws ConflictError if email already exists
   */
  public async signup(data: SignupDto): Promise<AuthResponse> {
    this.serviceLogger.info('Signup attempt', { email: data.email });

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      this.serviceLogger.warn('Signup failed - email already exists', {
        email: data.email,
      });
      throw new ConflictError('Email already registered');
    }

    // Hash password (bcrypt with 10 salt rounds)
    const hashedPassword = await passwordUtil.hashPassword(data.password);

    // Create user in database
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    this.serviceLogger.info('User created successfully', { userId: user.id });

    // Generate JWT token
    const token = jwtUtil.generateToken(user.id);

    // Return response (never include password!)
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * User Login - Authenticate existing user 
   * @param data - Login data (email, password)
   * @returns Auth response with token and user
   * @throws UnauthorizedError if credentials invalid
   */
  public async login(data: LoginDto): Promise<AuthResponse> {
    this.serviceLogger.info('Login attempt', { email: data.email });

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      this.serviceLogger.warn('Login failed - user not found', {
        email: data.email,
      });
      // Generic error - don't reveal if user exists
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await passwordUtil.comparePassword(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      this.serviceLogger.warn('Login failed - invalid password', {
        email: data.email,
      });
      // Same error as "user not found" - prevents enumeration
      throw new UnauthorizedError('Invalid credentials');
    }

    this.serviceLogger.info('Login successful', { userId: user.id });

    // Generate JWT token
    const token = jwtUtil.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Get User by ID
   * Used by auth middleware to fetch user details
   * 
   * @param userId - User ID from JWT token
   * @returns User data without password
   */
  public async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Close Prisma connection
   * Should be called when shutting down the application
   */
  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * Export singleton instance for use across application
 */
export const authService = AuthService.getInstance();