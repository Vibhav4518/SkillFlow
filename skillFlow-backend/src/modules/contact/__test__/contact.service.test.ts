import { describe, it, expect, vi } from 'vitest';
import { contactService } from '../contact.service.js';
import { prisma } from '../../../infrastructure/database/db.client.js';

describe('ContactService Unit Tests', () => {
  it('should submit a contact message', async () => {
    const mockMessage = {
      id: 'msg-1',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Inquiry',
      message: 'Need help with SkillFlow platform',
      status: 'NEW',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.spyOn(prisma.contactMessage, 'create').mockResolvedValue(mockMessage as any);

    const res = await contactService.submitMessage({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Inquiry',
      message: 'Need help with SkillFlow platform',
    });

    expect(res.id).toBe('msg-1');
    expect(res.status).toBe('NEW');
  });

  it('should list all contact messages', async () => {
    const mockMessages = [
      { id: 'msg-1', name: 'John', email: 'john@example.com', subject: 'Hi', message: 'Test', status: 'NEW' },
    ];
    vi.spyOn(prisma.contactMessage, 'findMany').mockResolvedValue(mockMessages as any);
    vi.spyOn(prisma.contactMessage, 'count').mockResolvedValue(1);

    const res = await contactService.getAllMessages({ page: 1, limit: 10 });
    expect(res.items).toHaveLength(1);
    expect(res.total).toBe(1);
  });

  it('should update contact message status', async () => {
    const mockUpdated = { id: 'msg-1', status: 'RESOLVED' };
    vi.spyOn(prisma.contactMessage, 'update').mockResolvedValue(mockUpdated as any);

    const res = await contactService.updateMessageStatus('msg-1', 'RESOLVED');
    expect(res.status).toBe('RESOLVED');
  });
});
