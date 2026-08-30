import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { notificationsService } from './notifications.service.js';

export const notificationsController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const notifications = await notificationsService.getNotifications(userId);
    res.status(200).json({ success: true, data: notifications });
  },

  async markRead(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = req.params.id as string;
    await notificationsService.markAsRead(id, userId);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  },

  async markAllRead(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    await notificationsService.markAllAsRead(userId);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = req.params.id as string;
    await notificationsService.deleteNotification(id, userId);
    res.status(200).json({ success: true, message: 'Notification removed' });
  }
};
