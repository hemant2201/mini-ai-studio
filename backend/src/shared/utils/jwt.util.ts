import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

/**
 * JWT Utility Class
 * Singleton pattern for consistent JWT operations
 */
export class JwtUtil {
  private static instance: JwtUtil;
  private readonly secret: string;
  private readonly expiresIn: string;

  private constructor() {
    this.secret = config.jwtSecret;
    this.expiresIn = config.jwtExpiresIn;
  }

  public static getInstance(): JwtUtil {
    if (!JwtUtil.instance) {
      JwtUtil.instance = new JwtUtil();
    }
    return JwtUtil.instance;
  }

  /**
   * Generate JWT token for authenticated user
   * @param userId - User ID to encode in token
   * @returns Signed JWT token string
   */
  public generateToken(userId: string): string {
    const payload = { userId };
    const options: SignOptions = {
      expiresIn: parseInt(this.expiresIn),
    };
    
    return jwt.sign(payload, this.secret, options);
  }

  /**
   * Verify and decode JWT token
   * @param token - JWT token to verify
   * @returns Decoded payload with userId
   * @throws Error if token is invalid or expired
   */
  public verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.secret) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const jwtUtil = JwtUtil.getInstance();
