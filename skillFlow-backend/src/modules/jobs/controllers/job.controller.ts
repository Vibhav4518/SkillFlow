import {
  Request,
  Response,
  NextFunction,
} from "express";

import { JobService } from "../services/job.service.js";

interface JobParams {
  jobId: string;
}

export class JobController {
  constructor(
    private readonly jobService: JobService
  ) {}

  // ==========================================================
  // GET /api/v1/jobs
  // ==========================================================

  async getAllJobs(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const jobs = await this.jobService.getAllJobs(req.query as any);

      res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // GET /api/v1/jobs/:jobId
  // ==========================================================

  async getJobById(
    req: Request<JobParams>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { jobId } = req.params;

      const job = await this.jobService.getJobById(jobId);

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // POST /api/v1/jobs
  // ==========================================================

  async createJob(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const job = await this.jobService.createJob(req.body, userId);

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // PUT /api/v1/jobs/:jobId
  // ==========================================================

  async updateJob(
    req: Request<JobParams>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { jobId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const job = await this.jobService.updateJob(jobId, req.body, userId, userRole);

      res.status(200).json({
        success: true,
        message: "Job updated successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // DELETE /api/v1/jobs/:jobId
  // ==========================================================

  async deleteJob(
    req: Request<JobParams>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { jobId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const userRole = (req as any).user?.role;

      await this.jobService.deleteJob(jobId, userId, userRole);

      res.status(200).json({
        success: true,
        message: "Job deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // POST /api/v1/jobs/:jobId/promote
  // ==========================================================

  async promoteJob(
    req: Request<JobParams>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { jobId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      const updatedJob = await this.jobService.promoteJob(jobId, userId, req.body);

      res.status(200).json({
        success: true,
        message: "Job promoted successfully",
        data: updatedJob,
      });
    } catch (error) {
      next(error);
    }
  }
}