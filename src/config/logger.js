import winston from 'winston';
import env from './env.js';

const {combine, timestamp, errors, json, printf} = winston.format;

// Dev: enak dibaca. Prod: JSON.
const devFormat = printf(({level, message, timestamp, ...meta}) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${rest}`;
});

const logger = winston.createLogger({
    level: env.logLevel,
    format: combine(
        timestamp(),
        errors({stack: true}),
        env.nodeEnv === 'production' ? json() : devFormat
    ),
    transports: [new winston.transports.Console()],
});

export default logger;