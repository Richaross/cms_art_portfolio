import { ILogger } from '../types';

describe('Logging Component (DIP)', () => {
  it('should allow logging an error through the ILogger interface', () => {
    // Arrange: Create a mock implementation of ILogger
    const mockLogger: ILogger = {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };

    const errorMessage = 'Test Error';
    const testError = new Error('Original Error');
    const context = { userId: '123' };

    // Act: Call the error method
    mockLogger.error(errorMessage, testError, context);

    // Assert: Verify the mock was called correctly
    expect(mockLogger.error).toHaveBeenCalledWith(errorMessage, testError, context);
  });
});
