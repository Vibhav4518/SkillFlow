import { type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.js";
import { EmployerDashboardService } from "../services/employer-dashboard.service.js";

export class EmployerDashboardController {
  constructor(
    private readonly employerDashboardService: EmployerDashboardService = new EmployerDashboardService(),
  ) {}

  getDashboard = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const stats = await this.employerDashboardService.getDashboardStats(userId!);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployerJobs = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const jobs = await this.employerDashboardService.getEmployerJobs(userId!, req.query as any);

      res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployerApplications = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const applications = await this.employerDashboardService.getEmployerApplications(userId!, req.query as any);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  };

  searchCandidates = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const candidates = await this.employerDashboardService.searchCandidates(userId!, req.query as any);

      res.status(200).json({
        success: true,
        data: candidates,
      });
    } catch (error) {
      next(error);
    }
  };
}
