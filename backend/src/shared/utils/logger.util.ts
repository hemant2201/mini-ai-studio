export class Logger {
  private static instance: Logger;
  private readonly context: string;

  private constructor(context: string = 'Application') {
    this.context = context;
  }

  public static getInstance(context?: string): Logger {
    if (!Logger.instance || context) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  public info(message: string, meta?: object): void {
    console.log(
      `[INFO] [${this.context}] ${new Date().toISOString()} - ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  }

  public error(message: string, error?: Error | unknown, meta?: object): void {
    console.error(
      `[ERROR] [${this.context}] ${new Date().toISOString()} - ${message}`,
      error instanceof Error ? error.stack : error,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  }

  public warn(message: string, meta?: object): void {
    console.warn(
      `[WARN] [${this.context}] ${new Date().toISOString()} - ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  }

  public debug(message: string, meta?: object): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[DEBUG] [${this.context}] ${new Date().toISOString()} - ${message}`,
        meta ? JSON.stringify(meta, null, 2) : ''
      );
    }
  }
}

export const logger = Logger.getInstance();
