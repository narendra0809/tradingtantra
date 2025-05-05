// config/redisClient.js
import Redis from "ioredis";

const redis = new Redis({
  host: '127.0.0.1',   // Redis server hostname
  port: 6379,          // Redis default port
  // password: 'your_password', // Uncomment if Redis is password protected
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

export default redis;
