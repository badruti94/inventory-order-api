import AppError from '../../utils/AppError.js';
import {withTransaction} from '../../database/tx.js';
import * as repo from './orders.repository.js';

export async function createOrder({userId, items}) {
    if(!Array.isArray(items) || items.length === 0){
        throw new AppError('items must be a non-empty array', 400, 'VALIDATION_ERROR');
    }

    // validation sederhana
    for (const it of items){
        if (!it.productId) throw new AppError('productId is required', 400, 'VALIDATION_ERROR');
        if (!Number.isInteger(it.quantity) || it.quantity <= 0){
            throw new AppError('quantity must be a positive integer', 400, 'VALIDATION_ERROR');
        }
    }


    return withTransaction(async (client) => {
        let totalPrice = 0;

        // lock + cek stok + hitung total
        const enriched = [];
        for (const it of items){
            const product = await repo.getProductForUpdate(client, it.productId);
            if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');

            if(product.stock < it.quantity){
                throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK', {
                    productId: it.productId,
                    available: product.stock,
                    requested: it.quantity,
                });
            }

            const lineTotal = Number(product.price) * it.quantity;
            totalPrice += lineTotal;

            enriched.push({
                productId: it.productId,
                quantity: it.quantity,
                price: product.price,
            });
        }

        const order = await repo.createOrder(client, {userId, totalPrice});

        for (const it of enriched){
            await repo.insertOrderItem(client, {
                orderId: order.id,
                productId: it.productId,
                quantity: it.quantity,
                price: it.price,
            });

            const updated = await repo.decrementStock(client, it.productId, it.quantity);
            if(!updated){
                throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK',{
                    productId: it.productId,
                    requested: it.quantity,
                });
            }
        }

        return {order, items: enriched};
    });
}