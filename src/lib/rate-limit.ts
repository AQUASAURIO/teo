// Simple in-memory rate limiter for API routes
// Tracks requests per IP within a sliding time window

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/**
 * Check if a request should be allowed or rate-limited.
 * @param ip - Client identifier (typically IP address)
 * @param limit - Max number of requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
export function rateLimit(ip: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= limit) return false;
  record.count++;
  return true;
}

// Cleanup old entries periodically to prevent memory leaks
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
      if (now - val.lastReset > 120000) rateLimitMap.delete(key);
    }
  }, 60000);
}
