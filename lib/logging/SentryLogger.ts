import * as Sentry from '@sentry/nextjs';
import { ILogger } from './types';

/**
 * Sentry implementation of the ILogger interface.
 */
export class SentryLogger implements ILogger {
  /**
   * Log an error to Sentry.
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    if (context) {
      Sentry.setContext('context', context);
    }

    if (error instanceof Error) {
      Sentry.captureException(error, { extra: { message } });
    } else {
      Sentry.captureMessage(`${message}: ${String(error)}`, 'error');
    }
  }

  /**
   * Log an info message to Sentry.
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (context) {
      Sentry.setContext('context', context);
    }
    Sentry.captureMessage(message, 'info');
  }

  /**
   * Log a warning message to Sentry.
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (context) {
      Sentry.setContext('context', context);
    }
    Sentry.captureMessage(message, 'warning');
  }
}
