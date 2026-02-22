import { query } from '../../database/query.js';

export async function getUserById(id) {
    const sql = `
    SELECT id, role
    FROM users
    WHERE id = $1
    `;

    const { rows } = await query(sql, [id], { op: 'getUserById' });
    return rows[0] ?? null;
}