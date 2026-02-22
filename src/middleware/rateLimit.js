import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {success: false, code: 'RATE_LIMITED', message: 'Too many login attempts'},
});

export const refreshLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {success: false, code: 'RATE_LIMITED', message: 'Too many refresh attempts'},
});