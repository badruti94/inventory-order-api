import { Router } from 'express';
import * as controller from './products.controller.js';
import { auth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', auth, requireRoles('admin', 'staff'), controller.create);
router.patch('/:id', auth, requireRoles('admin', 'staff'), controller.update);
router.delete('/:id', auth, requireRoles('admin', 'staff'), controller.remove);

export default router;