import * as service from './auth.service.js';

export async function register(req, res, next) {
    try {
        const result = await service.register(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {
    try {
        const result = await service.login(req.body);
        res.json({ success: true, data: result });  
    } catch (error) {
        next(error);
    }
}