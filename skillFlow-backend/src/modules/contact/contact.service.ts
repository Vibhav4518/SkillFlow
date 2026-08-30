import { prisma } from '../../infrastructure/database/db.client.js';

export const contactService = {
  async submitMessage(data: { name: string; email: string; subject: string; message: string }) {
    return prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });
  },

  async getAllMessages(query: { page?: number; limit?: number; status?: 'NEW' | 'READ' | 'RESOLVED' }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const where = query.status ? { status: query.status } : {};

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateMessageStatus(id: string, status: 'NEW' | 'READ' | 'RESOLVED') {
    return prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  },

  async deleteMessage(id: string) {
    return prisma.contactMessage.delete({
      where: { id },
    });
  }
};
