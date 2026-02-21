import logger from "../config/logger.js";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";

export default function errorHandler(err, req, res, next) {
    // Normalize error
    const isAppError = err instanceof AppError;

    const statusCode = isAppError ? err.statusCode : 500;
    const code = isAppError ? err.code : 'INTERNAL_ERROR';
    const message = isAppError ? err.message : 'Something went wrong';

    // Log with context
    logger.error('Request error', {
        requestId: req.requestId,
        code,
        statusCode,
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        // stack hanya untuk dev biar aman (prod jangan bocorin detail)
        stack: env.nodeEnv === 'production' ? undefined : err.stack,
    });

    // Response (jangan bocorin stack ke user)
    res.status(statusCode).json({
        success: false,
        code,
        message,
        requestId: req.requestId,
        ...(isAppError && err.details ? { details: err.details } : {}),
        ...(env.nodeEnv !== 'production' && !isAppError ? { debug: err.message } : {}),
    });
}