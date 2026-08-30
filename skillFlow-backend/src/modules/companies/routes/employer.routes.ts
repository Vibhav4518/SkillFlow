import { Router } from "express";
import { EmployerDashboardController } from "../controllers/employer-dashboard.controller.js";
import { authGuard } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import {
  employerJobsQuerySchema,
  employerApplicationsQuerySchema,
  employerCandidatesQuerySchema,
} from "../schemas/employer-dashboard.schema.js";

const router = Router();
const employerDashboardController = new EmployerDashboardController();

router.use(authGuard);
router.use(requireRole("EMPLOYER"));

router.get("/dashboard", employerDashboardController.getDashboard);
router.get("/jobs", validate(employerJobsQuerySchema), employerDashboardController.getEmployerJobs);
router.get("/applications", validate(employerApplicationsQuerySchema), employerDashboardController.getEmployerApplications);
router.get("/candidates", validate(employerCandidatesQuerySchema), employerDashboardController.searchCandidates);

export const employerRouter = router;
