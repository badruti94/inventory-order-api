import { Router } from 'express';
import * as controller from './auth.controller.js';
import * as tokenController from './auth.token.controller.js';

const router = Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', tokenController.refresh);
router.post('/logout', tokenController.logout);

export default router;