import Redis from "ioredis";

// Create a Redis client instance
// Defaults to localhost:6379 if REDIS_URL is not provided
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    // Retry strategy: retry every 2 seconds, max 3 times then fail silent-ish?
    // Actually, for a cache, we might want to fail fast if it's down, or just log error and proceed without cache.
    // ioredis by default keeps retrying.
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    // Don't crash the app if redis is down
    lazyConnect: true,
});

redis.on("error", (err) => {
    console.warn("Redis connection error:", err);
});

export default redis;
