import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import AppError from '../../utils/AppError.js';
import * as repo from './auth.repository.js';
import * as rtRepo from './refreshToken.repository.js';

function signAccessToken(payload) {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}
function signRefreshToken(payload) {
    return jwt.sign(payload, env.refreshTokenSecret, { expiresIn: env.refreshTokenExpiresIn });
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function computeExpiresAt(daysFromNow = 7) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString();
}

export async function register({ name, email, password }) {
    if (!name || !email || !password) {
        throw new AppError('name, email, password are required', 400, 'VALIDATION_ERROR');
    }

    const existing = await repo.findUserByEmail(email);
    if (existing) {
        throw new AppError('Email already registered', 409, 'EMAIL_ALREADY_USED');
    }

    const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);

    const user = await repo.createUser({
        name,
        email,
        passwordHash,
        role: 'customer',
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, type: 'refresh' });
    const tokenHash = hashToken(refreshToken);
    const expiresAt = computeExpiresAt(7);

    await rtRepo.insertRefreshToken({ userId: user.id, tokenHash, expiresAt });

    return { user, accessToken, refreshToken };
}

export async function login({ email, password }) {
    if (!email || !password) {
        throw new AppError('email and password required', 400, 'VALIDATION_ERROR');
    }

    const user = await repo.findUserByEmail(email);
    if (!user) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });

    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
    };

    const refreshToken = signRefreshToken({ sub: safeUser.id, type: 'refresh' });
    const tokenHash = hashToken(refreshToken);
    const expiresAt = computeExpiresAt(7);

    await rtRepo.insertRefreshToken({ userId: safeUser.id, tokenHash, expiresAt });

    return { user: safeUser, accessToken, refreshToken };
}