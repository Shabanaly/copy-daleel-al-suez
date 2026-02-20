export type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
};

// In-memory store for rate limiting
// Note: This only works for a single instance. In a serverless environment (like Vercel),
// this state is not shared across lambdas. A Redis store (like Upstash) is recommended
// for production scalability.
const storage = new Map<string, { count: number; reset: number }>();

/**
 * Simple Rate Limiter
 * @param key Unique key for the client (e.g., IP address)
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const record = storage.get(key);

    if (!record || now > record.reset) {
        // First request or window expired
        const newRecord = { count: 1, reset: now + windowMs };
        storage.set(key, newRecord);
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: newRecord.reset,
        };
    }

    if (record.count >= limit) {
        // Rate limit exceeded
        return {
            success: false,
            limit,
            remaining: 0,
            reset: record.reset,
        };
    }

    // Increment count
    record.count += 1;
    return {
        success: true,
        limit,
        remaining: limit - record.count,
        reset: record.reset,
    };
}

// Cleanup interval to prevent memory leaks (runs every minute)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of storage.entries()) {
            if (now > record.reset) {
                storage.delete(key);
            }
        }
    }, 60000);
}
