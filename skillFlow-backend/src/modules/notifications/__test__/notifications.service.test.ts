import { describe, it, expect, vi } from 'vitest';
import { notificationsService } from '../notifications.service.js';
import { prisma } from '../../../infrastructure/database/db.client.js';

describe('NotificationsService Unit Tests', () => {
  it('should fetch user notifications', async () => {
    const mockNotifs = [
      { id: 'notif-1', userId: 'user-1', title: 'New Alert', message: 'Hello', read: false, createdAt: new Date() },
    ];
    vi.spyOn(prisma.notification, 'findMany').mockResolvedValue(mockNotifs as any);

    const res = await notificationsService.getNotifications('user-1');
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe('New Alert');
  });

  it('should mark notification as read', async () => {
    vi.spyOn(prisma.notification, 'updateMany').mockResolvedValue({ count: 1 });

    const res = await notificationsService.markAsRead('notif-1', 'user-1');
    expect(res.count).toBe(1);
  });

  it('should mark all notifications as read', async () => {
    vi.spyOn(prisma.notification, 'updateMany').mockResolvedValue({ count: 3 });

    const res = await notificationsService.markAllAsRead('user-1');
    expect(res.count).toBe(3);
  });

  it('should delete notification', async () => {
    vi.spyOn(prisma.notification, 'deleteMany').mockResolvedValue({ count: 1 });

    const res = await notificationsService.deleteNotification('notif-1', 'user-1');
    expect(res.count).toBe(1);
  });
});
