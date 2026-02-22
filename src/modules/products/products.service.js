import AppError from '../../utils/AppError.js';
import * as repo from './products.repository.js';

export async function createProduct(payload) {
    if (payload.stock < 0) throw new AppError('Stock cannot be negative', 400, 'VALIDATION_ERROR');
    if (payload.price < 0) throw new AppError('Price cannot be negative', 400, 'VALIDATION_ERROR');

    return repo.createProduct(payload);
}

export async function getProduct(id) {
    const product = await repo.getProductById(id);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    return product;
}

export async function listProducts(queryParams) {
    return repo.listProducts(queryParams);
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
    return updated;
}

export async function deleteProduct(id) {
    const deleted = await repo.deleteProduct(id);
    if (!deleted) throw new AppError('Product not found', 404, 'NOT_FOUND');
    return { deletedId: deleted.id };
}