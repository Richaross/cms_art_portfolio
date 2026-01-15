import * as Sentry from '@sentry/nextjs';
import { SentryLogger } from '../SentryLogger';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
}));

describe('SentryLogger', () => {
  let logger: SentryLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = new SentryLogger();
  });

  it('should call Sentry.captureException when error is logged', () => {
    const message = 'Test Error';
    const error = new Error('Original Error');
    const context = { userId: '123' };

    logger.error(message, error, context);

    expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.any(Object));
    expect(Sentry.setContext).toHaveBeenCalledWith('context', context);
  });

  it('should call Sentry.captureMessage when info is logged', () => {
    const message = 'Info Message';
    const context = { info: 'data' };

    logger.info(message, context);

    expect(Sentry.captureMessage).toHaveBeenCalledWith(message, 'info');
    expect(Sentry.setContext).toHaveBeenCalledWith('context', context);
  });

  it('should call Sentry.captureMessage when warn is logged', () => {
    const message = 'Warning Message';
    const context = { warn: 'data' };

    logger.warn(message, context);

    expect(Sentry.captureMessage).toHaveBeenCalledWith(message, 'warning');
    expect(Sentry.setContext).toHaveBeenCalledWith('context', context);
  });
});
