import * as tokenService from './auth.token.service.js';

export async function refresh(req, res, next) {
    try {
        const result = await tokenService.refresh(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function logout(req, res, next) {
    try {
        const result = await tokenService.logout(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}