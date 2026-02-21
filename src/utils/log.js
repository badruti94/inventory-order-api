import logger from '../config/logger.js';

function baseMeta(req, meta) {
    return {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        ...meta,
    };
}

export function logInfo(req, message, meta = {}) {
    logger.info(message, baseMeta(req, meta));
}

export function logWarn(req, message, meta = {}) {
    logger.warn(message, baseMeta(req, meta));
}

export function logError(req, message, meta = {}) {
    logger.error(message, baseMeta(req, meta));
}