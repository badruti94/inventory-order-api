import pkg from 'pg';
import env from '../config/env.js';
import logger from '../config/logger.js';

const { Pool } = pkg;

const pool = new Pool({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    max: env.dbMaxPool,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    logger.error('Unexpected DB error', {
        message: err.message,
        stack: err.stack,
    });
});

export default pool;