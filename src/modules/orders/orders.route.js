import { Router } from 'express';
import * as controller from './orders.controller.js';
import { auth } from '../../middleware/auth.js';

const router = Router();
router.post('/', auth, controller.create);

export default router;