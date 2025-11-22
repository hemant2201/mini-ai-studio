import bcrypt from 'bcrypt';

export class PasswordUtil {
  private static instance: PasswordUtil;
  private readonly saltRounds: number = 10;

  private constructor() {}

  public static getInstance(): PasswordUtil {
    if (!PasswordUtil.instance) {
      PasswordUtil.instance = new PasswordUtil();
    }
    return PasswordUtil.instance;
  }

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  public validatePasswordStrength(password: string): {
    isValid: boolean;
    message?: string;
  } {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters',
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter',
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number',
      };
    }

    return { isValid: true };
  }
}

export const passwordUtil = PasswordUtil.getInstance();
