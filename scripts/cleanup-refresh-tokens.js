import { cleanupRefreshTokens } from '../src/modules/auth/refreshToken.repository.js';
import logger from '../src/config/logger.js';
import pool from '../src/database/pool.js';

async function main() {
    try {
        const deleted = await cleanupRefreshTokens();
        logger.info('Cleanup refresh tokens done', { deleted });
    } catch (error) {
        logger.error('Cleanup refresh tokens failed', { message: error.message, stack: error.stack });
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main();