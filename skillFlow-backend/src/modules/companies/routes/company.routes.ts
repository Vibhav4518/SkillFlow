import { Router } from "express";

import { CompanyController } from "../controllers/company.controller.js";

import {
  createCompanySchema,
  updateCompanySchema,
  companyIdParamSchema,
  updateCompanyVerificationSchema,
} from "../schemas/company.schema.js";

import { authGuard } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validation.middleware.js";

const router = Router();

const companyController = new CompanyController();

router.get("/employers", authGuard, companyController.getCompanyEmployers);
router.post("/employers", authGuard, companyController.addCompanyEmployer);
router.patch("/employers/:employerProfileId/toggle-active", authGuard, companyController.toggleEmployerStatus);

router.get("/", companyController.getAllCompanies);

router.get(
  "/:companyId",
  validate(companyIdParamSchema),
  companyController.getCompanyById,
);

router.post(
  "/",
  authGuard,
  validate(createCompanySchema),
  companyController.createCompany,
);

router.patch(
  "/:companyId",
  authGuard,
  validate(updateCompanySchema),
  companyController.updateCompany,
);

router.patch(
  "/:companyId/verification",
  authGuard,
  validate(updateCompanyVerificationSchema),
  companyController.updateVerificationStatus,
);

router.delete(
  "/:companyId",
  authGuard,
  validate(companyIdParamSchema),
  companyController.deleteCompany,
);

import { CompanyReviewController } from "../controllers/company-review.controller.js";

const companyReviewController = new CompanyReviewController();

router.get(
  "/:companyId/reviews",
  companyReviewController.getCompanyReviews,
);

router.post(
  "/:companyId/reviews",
  authGuard,
  companyReviewController.createCompanyReview,
);

export const companyRouter = router;
