import dotenv from 'dotenv';

dotenv.config();

export class Config {
  private static instance: Config;

  public readonly port: number;
  public readonly nodeEnv: string;
  public readonly jwtSecret: string;
  public readonly jwtExpiresIn: string;
  public readonly corsOrigin: string;
  public readonly uploadDir: string;
  public readonly maxFileSize: number;

  private constructor() {
    this.validateEnv();

    this.port = parseInt(process.env.PORT || '5000', 10);
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.jwtSecret = process.env.JWT_SECRET!;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private validateEnv(): void {
    const required = ['JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }
  }

  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  public isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  public isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}

export const config = Config.getInstance();
