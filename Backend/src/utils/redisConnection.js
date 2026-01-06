import dotenv from "dotenv";

dotenv.config();

/**
 * Get Redis connection config for BullMQ
 * Returns null if Redis is not configured (for graceful degradation)
 */
export const getRedisConnection = () => {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  const password = process.env.REDIS_PASSWORD;

  // If Redis is not configured, return null (BullMQ will handle gracefully)
  if (!host || !port) {
    console.warn("⚠️ Redis not configured. BullMQ workers will not start.");
    return null;
  }

  return {
    host,
    port: parseInt(port, 10),
    password: password || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
};

