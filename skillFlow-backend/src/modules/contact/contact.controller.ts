import { Request, Response } from 'express';
import { contactService } from './contact.service.js';

export const contactController = {
  async submit(req: Request, res: Response) {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, subject, message) are required.' });
    }
    const created = await contactService.submitMessage({ name, email, subject, message });
    res.status(201).json({ success: true, message: 'Message sent successfully.', data: created });
  },

  async list(req: Request, res: Response) {
    const result = await contactService.getAllMessages(req.query as any);
    res.status(200).json({ success: true, data: result });
  },

  async updateStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await contactService.updateMessageStatus(id, status);
    res.status(200).json({ success: true, message: 'Status updated', data: updated });
  },

  async remove(req: Request, res: Response) {
    const id = req.params.id as string;
    await contactService.deleteMessage(id);
    res.status(200).json({ success: true, message: 'Message deleted' });
  }
};
