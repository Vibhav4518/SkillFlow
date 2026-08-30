import { Router } from "express";
import multer from "multer";
import { authGuard } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import { candidateController } from "../controllers/candidate.controller.js";
import {
  updateProfileSchema, 
  createEducationSchema,
  updateEducationSchema,
  createLanguageSchema,
  updateLanguageSchema,
  createExperienceSchema,
  updateExperienceSchema,
  createProjectSchema,
  updateProjectSchema,
  createCertificationSchema,
  updateCertificationSchema,
  assignSkillsSchema,
} from "../schemas/candidate.schema.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const candidateRouter = Router();

// Apply authGuard to all candidate routes
candidateRouter.use(authGuard);

// --- Backward Compatibility / Basic Profile ---
candidateRouter.get("/me", candidateController.getMyProfile);
candidateRouter.get("/profile", candidateController.getBasicProfile);
candidateRouter.patch("/profile", validate(updateProfileSchema), candidateController.updateBasicProfile);
candidateRouter.put("/profile", validate(updateProfileSchema), candidateController.updateBasicProfile);

// --- Education ---
candidateRouter.post("/education", validate(createEducationSchema), candidateController.addEducation);
candidateRouter.get("/education", candidateController.getEducation);
candidateRouter.patch("/education/:educationId", validate(updateEducationSchema), candidateController.updateEducation);
candidateRouter.delete("/education/:educationId", candidateController.deleteEducation);

// --- Languages ---
candidateRouter.post("/languages", validate(createLanguageSchema), candidateController.addLanguage);
candidateRouter.get("/languages", candidateController.getLanguages);
candidateRouter.patch("/languages/:languageId", validate(updateLanguageSchema), candidateController.updateLanguage);
candidateRouter.delete("/languages/:languageId", candidateController.deleteLanguage);

// --- Experience / Internship ---
candidateRouter.post("/experience", validate(createExperienceSchema), candidateController.addExperience);
candidateRouter.get("/experience", candidateController.getExperiences);
candidateRouter.patch("/experience/:experienceId", validate(updateExperienceSchema), candidateController.updateExperience);
candidateRouter.delete("/experience/:experienceId", candidateController.deleteExperience);

// --- Projects ---
candidateRouter.post("/projects", validate(createProjectSchema), candidateController.addProject);
candidateRouter.get("/projects", candidateController.getProjects);
candidateRouter.patch("/projects/:projectId", validate(updateProjectSchema), candidateController.updateProject);
candidateRouter.delete("/projects/:projectId", candidateController.deleteProject);

// --- Certifications ---
candidateRouter.post("/certifications", validate(createCertificationSchema), candidateController.addCertification);
candidateRouter.get("/certifications", candidateController.getCertifications);
candidateRouter.patch("/certifications/:certificationId", validate(updateCertificationSchema), candidateController.updateCertification);
candidateRouter.delete("/certifications/:certificationId", candidateController.deleteCertification);

// --- Candidate Skills ---
candidateRouter.get("/skills", candidateController.getCandidateSkills);
candidateRouter.post("/skills", validate(assignSkillsSchema), candidateController.assignCandidateSkills);
candidateRouter.delete("/skills/:skillId", candidateController.deleteCandidateSkill);

// --- Resume ---
candidateRouter.post("/resume", upload.single("resume"), candidateController.uploadResume);
candidateRouter.get("/resume", candidateController.getResume);
candidateRouter.delete("/resume", candidateController.deleteResume);
candidateRouter.post("/resume/generate", candidateController.generateResumePdf);

// --- My Applications ---
candidateRouter.get("/applications", (req, res, next) => {
  if (typeof candidateController.getMyApplications === "function") {
    return candidateController.getMyApplications(req as any, res);
  }
  return next();
});

// --- Complete View Profile ---

candidateRouter.get("/:candidateId/profile", candidateController.getCompleteProfile);

export { candidateRouter };