export async function createOrder(client, { userId, totalPrice }) {
    const sql = `
    INSERT INTO orders (user_id, total_price)
    VALUES ($1, $2)
    RETURNING id, user_id, total_price, created_at
  `;
    const { rows } = await client.query(sql, [userId, totalPrice]);
    return rows[0];
}

export async function insertOrderItem(client, { orderId, productId, quantity, price }) {
    const sql = `
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
    const { rows } = await client.query(sql, [orderId, productId, quantity, price]);
    return rows[0];
}

/**
 * Ambil product + lock row supaya aman dari race condition.
 * SELECT ... FOR UPDATE => stok gak bisa dibaca/diupdate barengan sampai transaksi selesai.
 */
export async function getProductForUpdate(client, productId) {
    const sql = `
    SELECT id, price, stock
    FROM products
    WHERE id = $1
    FOR UPDATE
  `;
    const { rows } = await client.query(sql, [productId]);
    return rows[0] ?? null;
}

export async function decrementStock(client, productId, quantity) {
    const sql = `
    UPDATE products
    SET stock = stock - $2
    WHERE id = $1 AND stock >= $2
    RETURNING id, stock
  `;
    const { rows } = await client.query(sql, [productId, quantity]);
    return rows[0];
}