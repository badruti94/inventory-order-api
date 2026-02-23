import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import { initRabbit } from "./config/rabbitmq.js";
import redis from "./config/redis.js";
import pool from './database/pool.js';


function shutdown(signal, server) {
    logger.warn('Shutting down...', { signal });

    server.close(async () => {
        try {
            await pool.end();
            logger.info('DB pool closed');
            process.exit(0);
        } catch (error) {
            logger.error('Error closing DB pool', { message: error.message });
            process.exit(1);
        }
    });

    setTimeout(() => {
        logger.error('Force shutdown (timeout)');
        process.exit(1);
    }, 10_000).unref();
}

async function start() {
    try {
        await pool.query('SELECT 1');
        logger.info('Database connected');

        await redis.ping();

        await initRabbit();

        const server = app.listen(env.port, () => {
            logger.info(`Server running on port ${env.port}`);
        });

        process.on('SIGINT', () => shutdown('SIGINT', server));
        process.on('SIGTERM', () => shutdown('SIGTERM', server));
    } catch (err) {
        logger.error('Failed to connect to database', {
            message: err.message,
            stack: err.stack,
        });
        process.exit(1);
    }
}

start();