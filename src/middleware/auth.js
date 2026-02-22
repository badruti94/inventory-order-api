import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

export function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return next(new AppError('Missing Authorization header', 401, 'UNAUTHORIZED'));
    }

    const token = header.slice('Bearer '.length);

    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.user = { id: payload.sub, role: payload.role };
        return next();
    } catch (error) {
        return next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    }
}

export function requireRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
        if (!roles.includes(req.user.role)) {
            return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
        }
        next();
    };
}