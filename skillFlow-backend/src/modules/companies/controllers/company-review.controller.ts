import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.js";
import { CompanyReviewService } from "../services/company-review.service.js";

const reviewService = new CompanyReviewService();

export class CompanyReviewController {
  getCompanyReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { companyId } = req.params;
      const data = await reviewService.getCompanyReviews(companyId as string);
      res.status(200).json({
        success: true,
        message: "Company reviews retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createCompanyReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { companyId } = req.params;
      const userId = req.user!.userId;
      const { rating, title, review } = req.body;

      if (!rating || !review) {
        res.status(400).json({
          success: false,
          message: "Rating and review text are required.",
        });
        return;
      }

      const data = await reviewService.createCompanyReview({
        companyId: companyId as string,
        userId,
        rating: Number(rating),
        title,
        review,
      });

      res.status(201).json({
        success: true,
        message: "Company review submitted successfully",
        data,
      });
    } catch (error: any) {
      if (error.message?.includes("already submitted")) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };
}
