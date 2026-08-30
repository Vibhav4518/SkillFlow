import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../../../errors/app.error.js";
import { JobApplicationMapper } from "../mappers/job-application.mapper.js";
import { JobApplicationRepository } from "../repositories/job-application.repository.js";
import { JobApplicationService } from "../services/job-application.service.js";


export class JobApplicationController {
  constructor(
    private readonly jobApplicationService = new JobApplicationService(new JobApplicationRepository()),
  ) {}

  async create(req: Request, res: Response, next?: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const authContext = user ? { userId: user.userId || user.id, role: user.role } : undefined;

      const body = req.body;
      const application = await this.jobApplicationService.createJobApplication(body, authContext);

      res.status(201).json({
        success: true,
        message: "Job application created",
        data: JobApplicationMapper.toDto(application),
      });
    } catch (error) {
      if (next) return next(error);
      throw error;
    }
  }

  async findAll(req: Request, res: Response, next?: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const authContext = user ? { userId: user.userId || user.id, role: user.role } : undefined;
      const query = req.query as any;

      const applications = await this.jobApplicationService.getAllJobApplications(authContext, query);
      res.status(200).json({
        success: true,
        data: applications.map((app) => JobApplicationMapper.toDto(app)),
      });
    } catch (error) {
      if (next) return next(error);
      throw error;
    }
  }

  async findById(req: Request, res: Response, next?: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const authContext = user ? { userId: user.userId || user.id, role: user.role } : undefined;

      const application = await this.jobApplicationService.getJobApplicationById(String(req.params.id), authContext);
      if (!application) throw new NotFoundError("Job application not found");

      res.status(200).json({ success: true, data: JobApplicationMapper.toDto(application) });
    } catch (error) {
      if (next) return next(error);
      throw error;
    }
  }

  async update(req: Request, res: Response, next?: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const authContext = user ? { userId: user.userId || user.id, role: user.role } : undefined;

      const application = await this.jobApplicationService.updateJobApplication(
        String(req.params.id),
        req.body,
        authContext
      );

      res.status(200).json({
        success: true,
        message: "Job application updated",
        data: JobApplicationMapper.toDto(application),
      });
    } catch (error) {
      if (next) return next(error);
      throw error;
    }
  }

  async updateStatus(req: Request, res: Response, next?: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const authContext = { userId: user?.userId || user?.id, role: user?.role };

      const application = await this.jobApplicationService.updateApplicationStatus(
        String(req.params.id),
        req.body.status,
        authContext
      );

      res.status(200).json({
        success: true,
        message: "Application status updated successfully",
        data: JobApplicationMapper.toDto(application),
      });
    } catch (error) {
      if (next) return next(error);
      throw error;
    }
  }

  async delete(req: Request, res: Response, next?: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const authContext = user ? { userId: user.userId || user.id, role: user.role } : undefined;

      const application = await this.jobApplicationService.deleteJobApplication(
        String(req.params.id),
        authContext
      );

      res.status(200).json({
        success: true,
        message: "Job application deleted",
        data: JobApplicationMapper.toDto(application),
      });
    } catch (error) {
      if (next) return next(error);
      throw error;
    }
  }
}
