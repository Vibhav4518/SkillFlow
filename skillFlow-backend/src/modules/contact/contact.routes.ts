import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { contactController } from './contact.controller.js';

const router = Router();

// Public submission
router.post('/', contactController.submit);

// Admin moderation
router.get('/messages', requireAuth, requireRole('ADMIN'), contactController.list);
router.patch('/messages/:id', requireAuth, requireRole('ADMIN'), contactController.updateStatus);
router.delete('/messages/:id', requireAuth, requireRole('ADMIN'), contactController.remove);

export const contactRouter = router;
