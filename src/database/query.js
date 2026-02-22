import pool from './pool.js';
import logger from '../config/logger.js';

const SLOW_QUERY_MS = 200;

export async function query(text, params = [], meta = {}) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const durationMs = Date.now() - start;

        if (durationMs >= SLOW_QUERY_MS) {
            logger.warn('Slow DB query', { durationMs, text, meta });
        }

        return result;
    } catch (err) {
        logger.error('DB query error', {
            message: err.message,
            stack: err.stack,
            text,
            meta,
        });
        throw err;
    }
}