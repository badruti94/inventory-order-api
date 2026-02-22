import { query } from '../../database/query.js';

export async function insertRefreshToken({ userId, tokenHash, expiresAt }) {
    const sql = `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, token_hash, revoked_at, expires_at, created_at
    `;
    const { rows } = await query(sql, [userId, tokenHash, expiresAt], { op: 'insertRefreshToken' });
    return rows[0];
}

export async function findValidRefreshTokenByHash(tokenHash) {
    const sql = `
    SELECT id, user_id, token_hash, revoked_at, expires_at, created_at
    FROM refresh_tokens
    WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > now()
    LIMIT 1
    `;
    const { rows } = await query(sql, [tokenHash], { op: 'findValidRefreshTokenByHash' });
    return rows[0] ?? null;
}

export async function revokeRefreshToken(id) {
    const sql = `
    UPDATE refresh_tokens
    SET revoked_at = now()
    WHERE id = $1 AND revoked_at IS NULL
    RETURNING id, revoked_at
    `;
    const { rows } = await query(sql, [id], { op: 'revokeRefreshToken' });
    return rows[0] ?? null;
}

export async function revokeAllUserRefreshTokens(userId) {
    const sql = `
    UPDATE refresh_tokens
    SET revoked_at = now()
    WHERE user_id = $1 AND revoked_at IS NULL
    RETURNING id, revoked_at
    `;
    const { rows } = await query(sql, [userId], { op: 'revokeAllUserRefreshTokens' });
    return rows;
}