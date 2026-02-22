import pool from './pool.js';
import logger from '../config/logger.js';

export async function withTransaction(fn) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (rbErr) {
            logger.error('Rollback failed', { message: rbErr.message, stack: rbErr.stack });
        }
        throw err;
    } finally {
        client.release();
    }
}