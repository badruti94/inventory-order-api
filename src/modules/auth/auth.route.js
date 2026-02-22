import { Router } from 'express';
import * as controller from './auth.controller.js';
import * as tokenController from './auth.token.controller.js';
import { loginLimiter, refreshLimiter } from '../../middleware/rateLimit.js';

const router = Router();

router.post('/register', controller.register);
router.post('/login', loginLimiter, controller.login);
router.post('/refresh', refreshLimiter, tokenController.refresh);
router.post('/logout', tokenController.logout);

export default router;