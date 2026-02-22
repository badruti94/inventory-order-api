import * as service from './orders.service.js';

export async function create(req, res, next) {
    try {
        const result = await service.createOrder({
            userId: req.user.id,
            items: req.body.items,
        });
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}