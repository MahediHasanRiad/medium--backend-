import Redis from 'ioredis';
import { config } from '../config'; // Adjust path to your config

// Create a single shared ioredis instance
export const redis = new Redis(config.redisUrl, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay; // Automatically reconnects
  },
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
});