/**
 * Development-only logging utility
 * In production builds with drop_console enabled, these will be removed
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  private createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private storeLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Log informational message (development only)
   */
  log(message: string, ...args: unknown[]): void {
    if (!this.isDevelopment) return;

    const entry = this.createLogEntry('log', message, args);
    this.storeLog(entry);
    // eslint-disable-next-line no-console
    console.log(`[LOG] ${message}`, ...args);
  }

  /**
   * Log info message (development only)
   */
  info(message: string, ...args: unknown[]): void {
    if (!this.isDevelopment) return;

    const entry = this.createLogEntry('info', message, args);
    this.storeLog(entry);
    // eslint-disable-next-line no-console
    console.info(`[INFO] ${message}`, ...args);
  }

  /**
   * Log warning message (development only)
   */
  warn(message: string, ...args: unknown[]): void {
    if (!this.isDevelopment) return;

    const entry = this.createLogEntry('warn', message, args);
    this.storeLog(entry);
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Log error message (always logged, even in production)
   * In production, consider sending to error tracking service
   */
  error(message: string, error?: unknown): void {
    const entry = this.createLogEntry('error', message, error);
    this.storeLog(entry);

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, error);
    } else {
      // In production, you might want to send this to an error tracking service
      // Example: Sentry.captureException(error);
      // For now, we'll just store it
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, ...args: unknown[]): void {
    if (!this.isDevelopment) return;

    const entry = this.createLogEntry('debug', message, args);
    this.storeLog(entry);
    // eslint-disable-next-line no-console
    console.debug(`[DEBUG] ${message}`, ...args);
  }

  /**
   * Get recent logs (useful for debugging)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON (useful for bug reports)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = logger.log.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const debug = logger.debug.bind(logger);
