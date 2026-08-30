import { type Request, type Response, type NextFunction } from "express";
import { bookmarksService } from "./bookmarks.service.js";

export const bookmarksController = {
  async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const role = (req as any).user?.role;
      const data = await bookmarksService.getUserBookmarks(userId, role);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { jobId, applicationId, type } = req.body;
      const result = await bookmarksService.toggleBookmark(userId, { jobId, applicationId, type });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async checkBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { jobId, applicationId } = req.query as { jobId?: string; applicationId?: string };
      const result = await bookmarksService.checkBookmarkStatus(userId, { jobId, applicationId });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async deleteBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const id = req.params.id as string;
      await bookmarksService.deleteBookmark(userId, id);
      res.status(200).json({ success: true, message: "Bookmark removed successfully" });
    } catch (err) {
      next(err);
    }
  },
};
