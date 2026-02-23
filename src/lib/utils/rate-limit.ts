export type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
};

// In-memory store fallback for development
const storage = new Map<string, { count: number; reset: number }>();

/**
 * Get Redis client (dynamic import to avoid issues if not installed)
 */
async function getRedis() {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const { Redis } = await import('@upstash/redis');
            return new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
        } catch (e) {
            console.warn('Failed to load @upstash/redis, falling back to in-memory store.');
        }
    }
    return null;
}

/**
 * Simple Rate Limiter
 * @param key Unique key for the client (e.g., IP address)
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const redis = await getRedis();

    if (redis) {
        try {
            // Redis implementation (Atomic and distributed)
            const identifier = `ratelimit:${key}`;
            const count = await redis.incr(identifier);

            if (count === 1) {
                await redis.pexpire(identifier, windowMs);
            }

            const remaining = Math.max(0, limit - count);
            const pttl = await redis.pttl(identifier);
            const reset = Date.now() + (pttl > 0 ? pttl : windowMs);

            return {
                success: count <= limit,
                limit,
                remaining,
                reset,
            };
        } catch (e) {
            console.error('Redis ratelimit error, falling back to in-memory:', e);
        }
    }

    // --- In-memory Fallback ---
    const now = Date.now();
    const record = storage.get(key);

    if (!record || now > record.reset) {
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
        return {
            success: false,
            limit,
            remaining: 0,
            reset: record.reset,
        };
    }

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
