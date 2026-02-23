import { query } from '../../database/query.js';

export async function createProduct({ name, price, stock }) {
    const sql = `
    INSERT INTO products (name, price, stock)
    VALUES ($1, $2, $3)
    RETURNING id, name, price, stock, created_at
    `;
    const { rows } = await query(sql, [name, price, stock], { op: 'createProduct' });
    return rows[0];
}

export async function getProductById(id) {
    const sql = `
    SELECT id, name, price, stock, created_at
    FROM products
    WHERE id = $1`;
    const { rows } = await query(sql, [id], { op: 'getProductById' });
    return rows[0] ?? null;
}

export async function listProducts({ limit, offset }) {
    const sql = `
    SELECT id, name, price, stock, created_at
    FROM products
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `;
    const { rows } = await query(sql, [limit, offset], { op: 'listProducts' });
    return rows;
}

export async function updateProduct(id, { name, price, stock }) {
    const sql = `
    UPDATE products
    SET name = COALESCE($2, name),
        price = COALESCE($3, price),
        stock = COALESCE($4, stock)
    WHERE id = $1
    RETURNING id, name, price, stock, created_at
    `;

    const { rows } = await query(sql, [id, name ?? null, price ?? null, stock ?? null], { op: 'updateProduct' });
    return rows[0] ?? null;
}

export async function deleteProduct(id) {
    const sql = `DELETE FROM products WHERE id = $1 RETURNING id`;
    const { rows } = await query(sql, [id], { op: 'deleteProduct' });
    return rows[0] ?? null;
}