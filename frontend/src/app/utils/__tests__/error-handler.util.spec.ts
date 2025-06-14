import { 
  BacktestingError, 
  BacktestingErrorHandler, 
  ErrorDetails 
} from '../error-handler.util';

describe('BacktestingError', () => {
  it('should create error with details', () => {
    const details: ErrorDetails = {
      code: 'TEST_ERROR',
      message: 'Test error message',
      userMessage: 'User-friendly message',
      severity: 'medium',
      recoverable: true,
      retryable: false
    };

    const error = new BacktestingError(details);

    expect(error.name).toBe('BacktestingError');
    expect(error.message).toBe('Test error message');
    expect(error.details).toEqual(details);
    expect(error.originalError).toBeUndefined();
  });

  it('should create error with original error', () => {
    const details: ErrorDetails = {
      code: 'TEST_ERROR',
      message: 'Test error message',
      userMessage: 'User-friendly message',
      severity: 'high',
      recoverable: false,
      retryable: true
    };
    const originalError = new Error('Original error');

    const error = new BacktestingError(details, originalError);

    expect(error.details).toEqual(details);
    expect(error.originalError).toBe(originalError);
  });
});

describe('BacktestingErrorHandler', () => {
  describe('handleDataFetchError', () => {
    it('should return existing BacktestingError unchanged', () => {
      const details: ErrorDetails = {
        code: 'EXISTING_ERROR',
        message: 'Existing error',
        userMessage: 'Existing user message',
        severity: 'low',
        recoverable: true,
        retryable: false
      };
      const existingError = new BacktestingError(details);

      const result = BacktestingErrorHandler.handleDataFetchError(existingError);

      expect(result).toBe(existingError);
    });

    it('should handle network errors with status 0', () => {
      const error = { status: 0, message: 'Network error' };

      const result = BacktestingErrorHandler.handleDataFetchError(error, 'BTC');

      expect(result).toBeInstanceOf(BacktestingError);
      expect(result.details.code).toBe('NETWORK_ERROR');
      expect(result.details.message).toBe('Network error while fetching data for BTC');
      expect(result.details.userMessage).toBe('Unable to connect to data source. Please check your internet connection and try again.');
      expect(result.details.severity).toBe('medium');
      expect(result.details.recoverable).toBe(true);
      expect(result.details.retryable).toBe(true);
    });

    it('should handle network errors with NETWORK_ERROR code', () => {
      const error = { code: 'NETWORK_ERROR', message: 'Connection failed' };

      const result = BacktestingErrorHandler.handleDataFetchError(error);

      expect(result.details.code).toBe('NETWORK_ERROR');
      expect(result.details.message).toBe('Network error while fetching data');
      expect(result.details.userMessage).toBe('Unable to connect to data source. Please check your internet connection and try again.');
    });

    it('should handle 404 not found errors', () => {
      const error = { status: 404, message: 'Not found' };

      const result = BacktestingErrorHandler.handleDataFetchError(error, 'INVALID');

      expect(result.details.code).toBe('DATA_NOT_FOUND');
      expect(result.details.message).toBe('Historical data not available for INVALID');
      expect(result.details.userMessage).toContain('Historical data for INVALID is not available');
      expect(result.details.severity).toBe('medium');
      expect(result.details.recoverable).toBe(true);
      expect(result.details.retryable).toBe(false);
    });

    it('should handle 429 rate limit errors', () => {
      const error = { status: 429, message: 'Too many requests' };

      const result = BacktestingErrorHandler.handleDataFetchError(error, 'ETH');

      expect(result.details.code).toBe('RATE_LIMITED');
      expect(result.details.message).toBe('Rate limit exceeded while fetching data');
      expect(result.details.userMessage).toBe('Too many requests. Please wait a moment and try again.');
      expect(result.details.severity).toBe('low');
      expect(result.details.recoverable).toBe(true);
      expect(result.details.retryable).toBe(true);
    });

    it('should handle 500 server errors', () => {
      const error = { status: 500, message: 'Internal server error' };

      const result = BacktestingErrorHandler.handleDataFetchError(error);

      expect(result.details.code).toBe('SERVER_ERROR');
      expect(result.details.message).toBe('Server error while fetching data');
      expect(result.details.userMessage).toBe('The data service is temporarily unavailable. Please try again in a few minutes.');
      expect(result.details.severity).toBe('medium');
      expect(result.details.recoverable).toBe(true);
      expect(result.details.retryable).toBe(true);
    });

    it('should handle unknown errors with generic response', () => {
      const error = { status: 418, message: 'I am a teapot' };

      const result = BacktestingErrorHandler.handleDataFetchError(error, 'DOT');

      expect(result.details.code).toBe('DATA_ERROR');
      expect(result.details.message).toBe('Unknown error fetching data for DOT');
      expect(result.details.userMessage).toBe('An unexpected error occurred while loading data. Please try again.');
      expect(result.details.severity).toBe('medium');
      expect(result.details.recoverable).toBe(true);
      expect(result.details.retryable).toBe(true);
    });
  });
});