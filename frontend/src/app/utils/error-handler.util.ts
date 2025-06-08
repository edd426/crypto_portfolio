/**
 * Comprehensive error handling utilities for Phase 2 backtesting
 */

export interface ErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  retryable: boolean;
  context?: any;
}

export class BacktestingError extends Error {
  constructor(
    public readonly details: ErrorDetails,
    public readonly originalError?: Error
  ) {
    super(details.message);
    this.name = 'BacktestingError';
  }
}

/**
 * Error handler for backtesting operations
 */
export class BacktestingErrorHandler {
  
  /**
   * Handle historical data fetching errors
   */
  static handleDataFetchError(error: any, symbol?: string): BacktestingError {
    if (error instanceof BacktestingError) {
      return error;
    }

    // Network errors
    if (error.status === 0 || error.code === 'NETWORK_ERROR') {
      return new BacktestingError({
        code: 'NETWORK_ERROR',
        message: `Network error while fetching data${symbol ? ` for ${symbol}` : ''}`,
        userMessage: 'Unable to connect to data source. Please check your internet connection and try again.',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        context: { symbol, originalStatus: error.status }
      }, error);
    }

    // Data not found
    if (error.status === 404) {
      return new BacktestingError({
        code: 'DATA_NOT_FOUND',
        message: `Historical data not available${symbol ? ` for ${symbol}` : ''}`,
        userMessage: symbol ? 
          `Historical data for ${symbol} is not available. This coin may be too new or not supported.` :
          'The requested data was not found.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        context: { symbol }
      }, error);
    }

    // CORS errors
    if (error.status === 0 && error.message?.includes('CORS')) {
      return new BacktestingError({
        code: 'CORS_ERROR',
        message: 'CORS error accessing historical data',
        userMessage: 'Unable to access data due to security restrictions. Please contact support.',
        severity: 'high',
        recoverable: false,
        retryable: false,
        context: { symbol }
      }, error);
    }

    // Rate limiting
    if (error.status === 429) {
      return new BacktestingError({
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded while fetching data',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        severity: 'low',
        recoverable: true,
        retryable: true,
        context: { symbol, retryAfter: error.headers?.get('retry-after') }
      }, error);
    }

    // Server errors
    if (error.status >= 500) {
      return new BacktestingError({
        code: 'SERVER_ERROR',
        message: 'Server error while fetching data',
        userMessage: 'The data service is temporarily unavailable. Please try again in a few minutes.',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        context: { symbol, status: error.status }
      }, error);
    }

    // Generic data error
    return new BacktestingError({
      code: 'DATA_ERROR',
      message: `Unknown error fetching data${symbol ? ` for ${symbol}` : ''}`,
      userMessage: 'An unexpected error occurred while loading data. Please try again.',
      severity: 'medium',
      recoverable: true,
      retryable: true,
      context: { symbol, error: error.message }
    }, error);
  }

  /**
   * Handle backtesting calculation errors
   */
  static handleCalculationError(error: any, context?: any): BacktestingError {
    if (error instanceof BacktestingError) {
      return error;
    }

    // Insufficient data
    if (error.message?.includes('Insufficient data')) {
      return new BacktestingError({
        code: 'INSUFFICIENT_DATA',
        message: 'Insufficient historical data for backtesting',
        userMessage: 'Not enough historical data is available for the selected time period. Please choose a shorter period or different coins.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        context
      }, error);
    }

    // Invalid date range
    if (error.message?.includes('Invalid date') || error.message?.includes('date range')) {
      return new BacktestingError({
        code: 'INVALID_DATE_RANGE',
        message: 'Invalid date range for backtesting',
        userMessage: 'The selected date range is invalid. Please ensure the start date is before the end date and both are reasonable.',
        severity: 'low',
        recoverable: true,
        retryable: false,
        context
      }, error);
    }

    // Memory/performance errors
    if (error.message?.includes('Maximum call stack') || error.message?.includes('out of memory')) {
      return new BacktestingError({
        code: 'PERFORMANCE_ERROR',
        message: 'Calculation complexity too high',
        userMessage: 'The backtest is too complex for your browser. Please try a shorter time period or fewer coins.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        context
      }, error);
    }

    // Division by zero or invalid calculations
    if (error.message?.includes('division by zero') || error.message?.includes('NaN')) {
      return new BacktestingError({
        code: 'CALCULATION_ERROR',
        message: 'Invalid calculation in backtesting',
        userMessage: 'A calculation error occurred. This may be due to invalid price data or extreme market conditions.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        context
      }, error);
    }

    // Generic calculation error
    return new BacktestingError({
      code: 'UNKNOWN_CALCULATION_ERROR',
      message: 'Unknown error during backtesting calculation',
      userMessage: 'An unexpected error occurred during the backtest calculation. Please try again with different parameters.',
      severity: 'medium',
      recoverable: true,
      retryable: true,
      context
    }, error);
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: any, field?: string): BacktestingError {
    return new BacktestingError({
      code: 'VALIDATION_ERROR',
      message: `Validation error${field ? ` for ${field}` : ''}`,
      userMessage: error.message || 'Please check your input parameters and try again.',
      severity: 'low',
      recoverable: true,
      retryable: false,
      context: { field, originalMessage: error.message }
    }, error);
  }

  /**
   * Handle Azure Function errors
   */
  static handleFunctionError(error: any): BacktestingError {
    if (error.status === 404) {
      return new BacktestingError({
        code: 'FUNCTION_NOT_FOUND',
        message: 'Azure Function not found',
        userMessage: 'The data update service is not available. Historical data may be outdated.',
        severity: 'medium',
        recoverable: false,
        retryable: false
      }, error);
    }

    if (error.status === 500) {
      return new BacktestingError({
        code: 'FUNCTION_ERROR',
        message: 'Azure Function execution error',
        userMessage: 'The data update service encountered an error. Please try again later.',
        severity: 'medium',
        recoverable: true,
        retryable: true
      }, error);
    }

    return new BacktestingError({
      code: 'UNKNOWN_FUNCTION_ERROR',
      message: 'Unknown Azure Function error',
      userMessage: 'An error occurred with the backend service. Please try again.',
      severity: 'medium',
      recoverable: true,
      retryable: true
    }, error);
  }

  /**
   * Get user-friendly error message with suggested actions
   */
  static getUserMessage(error: BacktestingError): { message: string; actions: string[] } {
    const actions: string[] = [];

    if (error.details.retryable) {
      actions.push('Try again');
    }

    switch (error.details.code) {
      case 'NETWORK_ERROR':
        actions.push('Check your internet connection', 'Refresh the page');
        break;
      case 'DATA_NOT_FOUND':
        actions.push('Try different coins', 'Use a different time period');
        break;
      case 'INSUFFICIENT_DATA':
        actions.push('Select a shorter time period', 'Choose different cryptocurrencies', 'Use fewer coins in portfolio');
        break;
      case 'RATE_LIMITED':
        actions.push('Wait a few minutes', 'Reduce the number of simultaneous requests');
        break;
      case 'PERFORMANCE_ERROR':
        actions.push('Use a shorter time period', 'Reduce portfolio size', 'Try monthly instead of daily rebalancing');
        break;
      default:
        if (error.details.recoverable) {
          actions.push('Adjust your parameters', 'Contact support if the problem persists');
        }
    }

    return {
      message: error.details.userMessage,
      actions
    };
  }

  /**
   * Log error for debugging (respects debug levels)
   */
  static logError(error: BacktestingError, context?: string): void {
    const debugLevel = Number(localStorage.getItem('portfolioDebugLevel')) || 0;
    
    if (debugLevel >= 1) { // Error level
      console.error(`[BACKTEST ERROR]${context ? ` ${context}` : ''}:`, {
        code: error.details.code,
        message: error.details.message,
        severity: error.details.severity,
        context: error.details.context,
        originalError: error.originalError
      });
    }
  }

  /**
   * Check if error should trigger automatic retry
   */
  static shouldAutoRetry(error: BacktestingError, attemptCount: number): boolean {
    if (!error.details.retryable || attemptCount >= 3) {
      return false;
    }

    // Auto-retry for network errors and rate limits
    return ['NETWORK_ERROR', 'RATE_LIMITED', 'SERVER_ERROR'].includes(error.details.code);
  }

  /**
   * Get retry delay based on error type
   */
  static getRetryDelay(error: BacktestingError, attemptCount: number): number {
    switch (error.details.code) {
      case 'RATE_LIMITED':
        // Use retry-after header if available, otherwise exponential backoff
        const retryAfter = error.details.context?.retryAfter;
        return retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attemptCount), 30000);
      case 'NETWORK_ERROR':
      case 'SERVER_ERROR':
        // Exponential backoff for network/server errors
        return Math.min(1000 * Math.pow(2, attemptCount), 10000);
      default:
        return 1000 * attemptCount;
    }
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  getDelay: (attempt: number) => number = (attempt) => 1000 * Math.pow(2, attempt)
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      const delay = getDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}