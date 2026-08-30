import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { notificationsController } from './notifications.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', notificationsController.list);
router.patch('/read-all', notificationsController.markAllRead);
router.patch('/:id/read', notificationsController.markRead);
router.delete('/:id', notificationsController.remove);

export const notificationsRouter = router;
