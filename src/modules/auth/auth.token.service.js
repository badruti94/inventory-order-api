import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../../config/env.js';
import AppError from '../../utils/AppError.js';
import * as rtRepo from './refreshToken.repository.js';
import * as userRepo from './user.repository.js';

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(payload) {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}
function signRefreshToken(payload) {
    return jwt.sign(payload, env.refreshTokenSecret, { expiresIn: env.refreshTokenExpiresIn });
}

function computeExpiresAt(daysFromNow = 7) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString();
}

export async function refresh({ refreshToken }) {
    if (!refreshToken) throw new AppError('refreshToken is required', 400, 'VALIDATION_ERROR');

    //verify signature
    let payload;
    try {
        payload = jwt.verify(refreshToken, env.refreshTokenSecret);
    } catch (error) {
        throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
    }

    if (payload.type !== 'refresh') {
        throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
    }

    // verify exists in DB (not revoked & not expired)
    const tokenHash = hashToken(refreshToken);
    const stored = await rtRepo.findValidRefreshTokenByHash(tokenHash);
    if (!stored) throw new AppError('Refresh token revoked/expired', 401, 'UNAUTHORIZED');

    // ROTATION: revoke old, issue new
    await rtRepo.revokeRefreshToken(stored.id);

    const newRefreshToken = signRefreshToken({ sub: stored.user_id, type: 'refresh' });
    const newHash = hashToken(newRefreshToken);
    const expiresAt = computeExpiresAt(7);

    await rtRepo.insertRefreshToken({
        userId: stored.user_id,
        tokenHash: newHash,
        expiresAt,
    });

    const user = await userRepo.getUserById(stored.user_id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    const accessToken = signAccessToken({ sub: user.id, role: user.role });

    return { accessToken, refreshToken: newRefreshToken };
}

export async function logout({ refreshToken }) {
    if (!refreshToken) throw new AppError('refreshToken is required', 400, 'VALIDATION_ERROR');

    // we don't need verify() strictly, but good to filter garbage input
    try {
        jwt.verify(refreshToken, env.refreshTokenSecret);
    } catch (error) {
        // logout should still be safe; treat as already logged out
        return { loggedOut: true };
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await rtRepo.findValidRefreshTokenByHash(tokenHash);
    if (!stored) return { loggedOut: true };

    await rtRepo.revokeRefreshToken(stored.id);
    return { loggedOut: true };
}