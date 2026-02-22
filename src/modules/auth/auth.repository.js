import { query } from '../../database/query.js';

export async function findUserByEmail(email) {
    const sql = `
    SELECT id, name, email, password, role, created_at
    FROM users
    WHERE email = $1
    `;
    const { rows } = await query(sql, [email], { op: 'findUserByEmail' });
    return rows[0] ?? null;
}

export async function createUser({ name, email, passwordHash, role = 'customer' }) {
    const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
    `;
    const { rows } = await query(sql, [name, email, passwordHash, role], { op: 'createUser' });
    return rows[0];
}