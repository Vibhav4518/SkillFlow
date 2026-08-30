import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { JobRepository } from "../repositories/job.repository.js";
import { JobService } from "../services/job.service.js";
import { JobController } from "../controllers/job.controller.js";

const router = Router();

// Dependency Injection
const jobRepository = new JobRepository();
const jobService = new JobService(jobRepository);
const jobController = new JobController(jobService);

// Helper wrapper to handle promises & fix TypeScript handler typing
const asyncHandler = (fn: (...args: any[]) => any): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

import { authGuard } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import { promoteJobSchema } from "../validators/job.validator.js";

// ============================================================
// JOB ROUTES
// ============================================================

// Public: browse/search jobs with filters
router.get(
  "/",
  asyncHandler(jobController.getAllJobs.bind(jobController))
);

// Employer: create a new job
router.post(
  "/",
  authGuard,
  requireRole("EMPLOYER"),
  asyncHandler((req, res, next) => (jobController.createJob ? jobController.createJob(req, res, next) : next()))
);

// Employer/Admin: promote a job (must come before /:jobId)
router.post(
  "/:jobId/promote",
  authGuard,
  requireRole("EMPLOYER"),
  validate(promoteJobSchema),
  asyncHandler((req, res, next) => (jobController.promoteJob ? jobController.promoteJob(req, res, next) : next()))
);

// Employer/Admin: update a job
router.put(
  "/:jobId",
  authGuard,
  requireRole("EMPLOYER", "ADMIN"),
  asyncHandler((req, res, next) => (jobController.updateJob ? jobController.updateJob(req, res, next) : next()))
);

router.patch(
  "/:jobId",
  authGuard,
  requireRole("EMPLOYER", "ADMIN"),
  asyncHandler((req, res, next) => (jobController.updateJob ? jobController.updateJob(req, res, next) : next()))
);

// Employer/Admin: delete (soft) a job
router.delete(
  "/:jobId",
  authGuard,
  requireRole("EMPLOYER", "ADMIN"),
  asyncHandler((req, res, next) => (jobController.deleteJob ? jobController.deleteJob(req, res, next) : next()))
);

// Public: get single job detail (must come after specific routes)
router.get(
  "/:jobId",
  asyncHandler(jobController.getJobById.bind(jobController))
);

export default router;