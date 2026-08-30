import { Router } from "express";
import { JobApplicationController } from "../controllers/job-application.controller.js";
import { authGuard } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import {
  createJobApplicationSchema,
  updateJobApplicationSchema,
  updateApplicationStatusSchema,
} from "../schemas/job-application.schema.js";

const router = Router();
const jobApplicationController = new JobApplicationController();

// Create application
router.post(
  "/",
  (req, res, next) => {
    if (req.headers.authorization) {
      return authGuard(req, res, next);
    }
    next();
  },
  validate(createJobApplicationSchema),
  (req, res, next) => jobApplicationController.create(req, res, next)
);

// Get applications list (scoped by role if auth token is provided)
router.get("/", (req, res, next) => {
  if (req.headers.authorization) {
    return authGuard(req, res, () => jobApplicationController.findAll(req, res, next));
  }
  return jobApplicationController.findAll(req, res, next);
});

// Update application status (dedicated recruitment pipeline endpoint)
router.patch(
  "/:id/status",
  authGuard,
  requireRole("EMPLOYER", "ADMIN"),
  validate(updateApplicationStatusSchema),
  (req, res, next) => jobApplicationController.updateStatus(req, res, next)
);

// Withdraw application (candidate)
router.patch(
  "/:id/withdraw",
  authGuard,
  requireRole("CANDIDATE"),
  (req, res, next) => {
    req.body = { ...req.body, status: "WITHDRAWN" };
    return jobApplicationController.updateStatus(req, res, next);
  }
);

// Get applications by job (employer-scoped)
router.get(
  "/job/:jobId",
  authGuard,
  requireRole("EMPLOYER", "ADMIN"),
  (req, res, next) => {
    (req as any).query = { ...(req as any).query, jobId: req.params.jobId };
    return jobApplicationController.findAll(req, res, next);
  }
);

// Legacy URL helpers
router.put("/", (req, res, next) => {
  const idToUpdate = req.body?.id || req.body?.applicationId || req.query?.id;
  if (idToUpdate) {
    (req as any).params = { id: String(idToUpdate) };
    return jobApplicationController.update(req, res, next);
  }
  res.status(400).json({
    success: false,
    message: 'To update an application, please provide an ID in the URL path (e.g. PUT /api/v1/job-applications/app_9001) or include "id" in the request body.',
  });
});

router.patch("/", (req, res, next) => {
  const idToUpdate = req.body?.id || req.body?.applicationId || req.query?.id;
  if (idToUpdate) {
    (req as any).params = { id: String(idToUpdate) };
    return jobApplicationController.update(req, res, next);
  }
  res.status(400).json({
    success: false,
    message: 'To update an application, please provide an ID in the URL path (e.g. PATCH /api/v1/job-applications/app_9001) or include "id" in the request body.',
  });
});

router.delete("/", (req, res, next) => {
  const idToDelete = req.body?.id || req.query?.id;
  if (idToDelete) {
    (req as any).params = { id: String(idToDelete) };
    return jobApplicationController.delete(req, res, next);
  }
  res.status(400).json({
    success: false,
    message: 'To delete an application, please provide an ID in the URL path (e.g. DELETE /api/v1/job-applications/app_9001) or in the request body.',
  });
});

// Single application details
router.get("/:id", (req, res, next) => {
  if (req.headers.authorization) {
    return authGuard(req, res, () => jobApplicationController.findById(req, res, next));
  }
  return jobApplicationController.findById(req, res, next);
});

// Update application
router.put("/:id", (req, res, next) => {
  if (req.headers.authorization) {
    return authGuard(req, res, () => jobApplicationController.update(req, res, next));
  }
  return jobApplicationController.update(req, res, next);
});

router.patch("/:id", validate(updateJobApplicationSchema), (req, res, next) => {
  if (req.headers.authorization) {
    return authGuard(req, res, () => jobApplicationController.update(req, res, next));
  }
  return jobApplicationController.update(req, res, next);
});


// Delete / Withdraw application
router.delete("/:id", (req, res, next) => {
  if (req.headers.authorization) {
    return authGuard(req, res, () => jobApplicationController.delete(req, res, next));
  }
  return jobApplicationController.delete(req, res, next);
});

export const jobApplicationRoutes = router;
