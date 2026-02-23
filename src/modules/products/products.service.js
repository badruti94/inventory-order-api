import AppError from '../../utils/AppError.js';
import * as repo from './products.repository.js';
import redis from '../../config/redis.js';
import logger from '../../config/logger.js';
const CACHE_TTL = 60;

async function flushRedis() {
    const keys = await redis.keys('products:*');
    if(keys.length){
        await redis.del(keys);
    }
}

export async function createProduct(payload) {
    if (payload.stock < 0) throw new AppError('Stock cannot be negative', 400, 'VALIDATION_ERROR');
    if (payload.price < 0) throw new AppError('Price cannot be negative', 400, 'VALIDATION_ERROR');

    await flushRedis();

    return repo.createProduct(payload);
}

export async function getProduct(id) {
    const product = await repo.getProductById(id);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    return product;
}

export async function listProducts({ limit = 10, offset = 0 }) {
    const cacheKey = `products:${limit}:${offset}`;

    const cached = await redis.get(cacheKey);
    if (cached){
        return JSON.parse(cached);
    }

    const products = await repo.listProducts({limit, offset});

    await redis.set(cacheKey, JSON.stringify(products), 'EX', CACHE_TTL);

    return products;
}

export async function updateProduct(id, payload) {
    if (payload.stock != null && payload.stock < 0) {
        throw new AppError('Stock cannot be negative', 400, 'VALIDATION_ERROR');
    }
    if (payload.price != null && payload.price < 0) {
        throw new AppError('Price cannot be negative', 400, 'VALIDATION_ERROR');
    }

    const updated = await repo.updateProduct(id, payload);
    if (!updated) throw new AppError('Product not found', 404, 'NOT_FOUND');

    await flushRedis();

    return updated;
}

export async function deleteProduct(id) {
    const deleted = await repo.deleteProduct(id);
    if (!deleted) throw new AppError('Product not found', 404, 'NOT_FOUND');

    await flushRedis();

    return { deletedId: deleted.id };
}