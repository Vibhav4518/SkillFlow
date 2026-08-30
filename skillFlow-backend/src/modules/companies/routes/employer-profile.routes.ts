import { Router } from "express";
import { EmployerProfileController } from "../controllers/employer-profile.controller.js";
import {
  createEmployerProfileSchema,
  updateEmployerProfileSchema,
} from "../schemas/employer-profile.schema.js";
import { authGuard } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validation.middleware.js";

const router = Router();
const employerProfileController = new EmployerProfileController();

router.post(
  "/",
  authGuard,
  requireRole("EMPLOYER"),
  validate(createEmployerProfileSchema),
  employerProfileController.createProfile,
);

router.get(
  "/me",
  authGuard,
  requireRole("EMPLOYER"),
  employerProfileController.getMyProfile,
);

router.patch(
  "/me",
  authGuard,
  requireRole("EMPLOYER"),
  validate(updateEmployerProfileSchema),
  employerProfileController.updateMyProfile,
);

export const employerProfileRouter = router;
