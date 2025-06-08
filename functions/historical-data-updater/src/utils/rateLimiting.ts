/**
 * Rate limiting utilities for CoinGecko API compliance
 */

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  retryAfterMs: number;
  maxRetries: number;
}

interface RequestTracker {
  timestamps: number[];
  lastResetTime: number;
}

export class RateLimiter {
  private requestTracker: RequestTracker = {
    timestamps: [],
    lastResetTime: Date.now()
  };

  private config: RateLimitConfig = {
    maxRequestsPerMinute: 45, // Leave buffer below CoinGecko's 50/minute limit
    maxRequestsPerHour: 2700, // Leave buffer below CoinGecko's 3000/hour limit
    retryAfterMs: 65000, // Wait 65 seconds after rate limit hit
    maxRetries: 3
  };

  /**
   * Check if we can make a request without hitting rate limits
   */
  canMakeRequest(): boolean {
    this.cleanupOldTimestamps();
    
    const now = Date.now();
    const minuteAgo = now - 60000;
    const hourAgo = now - 3600000;
    
    const requestsInLastMinute = this.requestTracker.timestamps.filter(t => t > minuteAgo).length;
    const requestsInLastHour = this.requestTracker.timestamps.filter(t => t > hourAgo).length;
    
    return (
      requestsInLastMinute < this.config.maxRequestsPerMinute &&
      requestsInLastHour < this.config.maxRequestsPerHour
    );
  }

  /**
   * Record a successful request
   */
  recordRequest(): void {
    this.requestTracker.timestamps.push(Date.now());
    this.cleanupOldTimestamps();
  }

  /**
   * Get delay before next request can be made
   */
  getDelayUntilNextRequest(): number {
    if (this.canMakeRequest()) {
      return 0;
    }

    const now = Date.now();
    const minuteAgo = now - 60000;
    
    const requestsInLastMinute = this.requestTracker.timestamps.filter(t => t > minuteAgo);
    
    if (requestsInLastMinute.length >= this.config.maxRequestsPerMinute) {
      // Wait until oldest request in current minute expires
      const oldestInMinute = Math.min(...requestsInLastMinute);
      return (oldestInMinute + 60000) - now + 1000; // Add 1 second buffer
    }

    return this.config.retryAfterMs;
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    requestsPerMinute: number;
    requestsPerHour: number;
    canMakeRequest: boolean;
    nextRequestDelay: number;
  } {
    this.cleanupOldTimestamps();
    
    const now = Date.now();
    const minuteAgo = now - 60000;
    const hourAgo = now - 3600000;
    
    const requestsInLastMinute = this.requestTracker.timestamps.filter(t => t > minuteAgo).length;
    const requestsInLastHour = this.requestTracker.timestamps.filter(t => t > hourAgo).length;
    
    return {
      requestsPerMinute: requestsInLastMinute,
      requestsPerHour: requestsInLastHour,
      canMakeRequest: this.canMakeRequest(),
      nextRequestDelay: this.getDelayUntilNextRequest()
    };
  }

  /**
   * Wait for rate limit to allow next request
   */
  async waitForNextRequest(): Promise<void> {
    const delay = this.getDelayUntilNextRequest();
    if (delay > 0) {
      console.log(`Rate limit reached. Waiting ${Math.round(delay / 1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Clean up old timestamps to prevent memory growth
   */
  private cleanupOldTimestamps(): void {
    const now = Date.now();
    const hourAgo = now - 3600000;
    
    // Keep only timestamps from the last hour
    this.requestTracker.timestamps = this.requestTracker.timestamps.filter(t => t > hourAgo);
    
    // Reset tracker daily to prevent any long-term memory issues
    if (now - this.requestTracker.lastResetTime > 86400000) {
      this.requestTracker.timestamps = [];
      this.requestTracker.lastResetTime = now;
    }
  }

  /**
   * Execute a function with automatic rate limiting
   */
  async executeWithRateLimit<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    await this.waitForNextRequest();
    
    try {
      const result = await operation();
      this.recordRequest();
      
      if (context) {
        console.log(`✅ Rate-limited request completed: ${context}`);
      }
      
      return result;
    } catch (error: any) {
      // Handle rate limit responses from API
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : this.config.retryAfterMs;
        
        console.warn(`Rate limit hit from API. Waiting ${waitTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Retry the operation
        return this.executeWithRateLimit(operation, context);
      }
      
      throw error;
    }
  }

  /**
   * Create a rate-limited version of a function
   */
  createRateLimitedFunction<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ): (...args: T) => Promise<R> {
    return (...args: T) => {
      return this.executeWithRateLimit(() => fn(...args), context);
    };
  }
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new RateLimiter();

/**
 * Batch processor with rate limiting
 */
export class RateLimitedBatchProcessor<T, R> {
  constructor(
    private rateLimiter: RateLimiter,
    private batchSize: number = 5,
    private batchDelayMs: number = 1000
  ) {}

  /**
   * Process items in batches with rate limiting
   */
  async processBatch(
    items: T[],
    processor: (item: T) => Promise<R>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      
      // Process batch items in parallel with rate limiting
      const batchPromises = batch.map(item => 
        this.rateLimiter.executeWithRateLimit(() => processor(item))
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Collect successful results and log failures
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Batch item ${i + index} failed:`, result.reason);
        }
      });
      
      // Report progress
      if (onProgress) {
        onProgress(Math.min(i + this.batchSize, items.length), items.length);
      }
      
      // Wait between batches (except for the last batch)
      if (i + this.batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelayMs));
      }
    }
    
    return results;
  }
}

/**
 * Monitor and log rate limit usage
 */
export class RateLimitMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  
  /**
   * Start monitoring rate limit status
   */
  startMonitoring(intervalMs: number = 60000): void {
    this.checkInterval = setInterval(() => {
      const status = globalRateLimiter.getStatus();
      
      console.log(`[RATE LIMIT] Minute: ${status.requestsPerMinute}/45, Hour: ${status.requestsPerHour}/2700`);
      
      // Warn if approaching limits
      if (status.requestsPerMinute > 40) {
        console.warn(`⚠️ Approaching minute rate limit: ${status.requestsPerMinute}/45`);
      }
      
      if (status.requestsPerHour > 2500) {
        console.warn(`⚠️ Approaching hour rate limit: ${status.requestsPerHour}/2700`);
      }
    }, intervalMs);
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

/**
 * Get statistics for cost monitoring
 */
export function getRateLimitStats(): {
  totalRequests: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  estimatedMonthlyCost: number;
} {
  const status = globalRateLimiter.getStatus();
  
  // CoinGecko free tier: 10,000 requests/month
  // If we exceed, we'd need to estimate paid tier costs
  const estimatedMonthlyRequests = status.requestsPerHour * 24 * 30;
  const freeMonthlyLimit = 10000;
  
  let estimatedMonthlyCost = 0;
  if (estimatedMonthlyRequests > freeMonthlyLimit) {
    // This is hypothetical - CoinGecko paid plans vary
    // For demo purposes, assume $0.001 per request over limit
    estimatedMonthlyCost = (estimatedMonthlyRequests - freeMonthlyLimit) * 0.001;
  }
  
  return {
    totalRequests: status.requestsPerHour, // Current hour
    requestsPerMinute: status.requestsPerMinute,
    requestsPerHour: status.requestsPerHour,
    estimatedMonthlyCost
  };
}