import Redis from 'ioredis';
import env from './env.js';
import logger from './logger.js';

const redis = new Redis({
    host: env.redisHost,
    port: env.redisPort,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on('connect', () => {
    logger.info('Redis connected');
});

redis.on('error', (err) => {
    logger.error('Redis error', { message: err.message });
});

export default redis;