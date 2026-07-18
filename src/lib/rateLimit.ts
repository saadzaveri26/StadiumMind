interface RateLimitRecord {
  timestamps: number[];
}

const cache = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks if a client key (e.g. IP address) exceeds the rate limit using a sliding window.
 * Removes outdated timestamps and returns request capacity.
 * @param key - The unique client identifier.
 * @param limit - Maximum requests allowed in the window.
 * @param windowMs - Time window size in milliseconds.
 * @returns Result object containing success state, limit, remaining attempts, and reset timestamp.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = cache.get(key);
  if (!record) {
    record = { timestamps: [] };
    cache.set(key, record);
  }

  // Filter out timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = oldestTimestamp + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTime,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: now + windowMs,
  };
}

/**
 * Helper to extract IP address or unique request signature from Next.js request.
 * @param request - Next.js Request object.
 * @returns IP address or fallback identifier.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return "127.0.0.1";
}
