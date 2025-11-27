import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter for webhook endpoints
 * Policy: 10 requests per 10 seconds per identifier (IP or Token)
 */
let ratelimit: Ratelimit | null = null;

export function getRateLimiter(): Ratelimit {
  if (ratelimit) {
    return ratelimit;
  }

  // Initialize Upstash Redis client
  // These should be set in environment variables
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@signalci/webhook",
  });

  return ratelimit;
}

/**
 * Check rate limit for a given identifier
 * @param identifier - IP address or token
 * @returns Object with { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(identifier: string) {
  const limiter = getRateLimiter();
  return await limiter.limit(identifier);
}

