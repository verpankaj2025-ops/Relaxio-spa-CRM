/**
 * Production Rate Limiter Utility (Token Bucket Algorithm)
 * Prevents rapid spamming or automated submission on sensitive actions like auth, exports, and customer mutations.
 */

interface RateLimiterOptions {
  tokensPerInterval: number; // Max operations allowed per interval
  intervalMs: number;       // Time frame in milliseconds
}

class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly intervalMs: number;

  constructor(options: RateLimiterOptions) {
    this.maxTokens = options.tokensPerInterval;
    this.tokens = options.tokensPerInterval;
    this.intervalMs = options.intervalMs;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed > this.intervalMs) {
      this.tokens = this.maxTokens;
      this.lastRefill = now;
    }
  }

  public tryConsume(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  public getRemainingTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// Global rate limiter instances for key actions
export const authRateLimiter = new TokenBucketRateLimiter({ tokensPerInterval: 5, intervalMs: 60000 }); // 5 attempts per min
export const exportRateLimiter = new TokenBucketRateLimiter({ tokensPerInterval: 10, intervalMs: 60000 }); // 10 exports per min
export const mutationRateLimiter = new TokenBucketRateLimiter({ tokensPerInterval: 30, intervalMs: 60000 }); // 30 mutations per min
