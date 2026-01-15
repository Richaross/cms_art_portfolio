/**
 * Interface for logging services.
 * Adheres to Dependency Inversion Principle (DIP).
 */
export interface ILogger {
  /**
   * Log an error.
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>): void;

  /**
   * Log an informational message.
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a warning message.
   */
  warn(message: string, context?: Record<string, unknown>): void;
}
