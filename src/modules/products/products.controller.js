import * as service from './products.service.js';

export async function create(req, res, next) {
    try {
        const product = await service.createProduct(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
}

export async function getById(req, res, next) {
    try {
        const product = await service.getProduct(req.params.id);
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
}

export async function list(req, res, next) {
    try {
        const limit = Number(req.query.limit ?? 10);
        const offset = Number(req.query.offset ?? 0);

        const products = await service.listProducts({ limit, offset });
        res.json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const product = await service.updateProduct(req.params.id, req.body);
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
}

export async function remove(req, res, next) {
    try {
        const result = await service.deleteProduct(req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}