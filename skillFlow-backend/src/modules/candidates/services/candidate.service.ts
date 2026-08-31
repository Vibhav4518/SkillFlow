import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import { JobApplicationRepository } from "../../jobApplication/repositories/job-application.repository.js";
import { JobApplicationMapper } from "../../jobApplication/mappers/job-application.mapper.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../errors/app.error.js";
import { candidateMapper } from "../mappers/candidate.mapper.js";
import { candidateRepository, type CandidateWithRelations } from "../repositories/candidate.repository.js";
import type {
  UpdateCandidateProfileDto,
  CreateEducationDto, 
  UpdateEducationDto,
  CreateLanguageDto,
  UpdateLanguageDto,
  CreateExperienceDto,
  UpdateExperienceDto,
  CreateProjectDto,
  UpdateProjectDto,
  CreateCertificationDto,
  UpdateCertificationDto,
} from "../dtos/candidate.dto.js";

export const candidateService = {
  // --- Helper to get or auto-create candidate profile ---
  async getOrCreateCandidateProfile(userId: string): Promise<CandidateWithRelations> {
    let candidate = await candidateRepository.findByUserId(userId);
    if (!candidate) {
      // Check user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundError("User not found");
      }
      await prisma.candidateProfile.create({
        data: {
          id: crypto.randomUUID(),
          userId,
        },
      });
      candidate = await candidateRepository.findByUserId(userId);
      if (!candidate) {
        throw new NotFoundError("Candidate profile not found");
      }
    }
    return candidate;
  },

  // --- Basic Profile ---
  async getMyProfile(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    return candidateMapper.toCompleteProfileResponse(candidate);
  },

  async getBasicProfile(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    return candidateMapper.toBasicDetailsDto(candidate);
  },

  async updateBasicProfile(userId: string, data: UpdateCandidateProfileDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    await candidateRepository.updateProfile(candidate.id, data);
    return this.getMyProfile(userId);
  },

  // --- Education ---
  async addEducation(userId: string, data: CreateEducationDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const edu = await candidateRepository.createEducation(candidate.id, data);
    return candidateMapper.toEducationDto(edu);
  },

  async getEducation(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const list = await candidateRepository.getEducation(candidate.id);
    return list.map((item) => candidateMapper.toEducationDto(item));
  },

  async updateEducation(userId: string, educationId: string, data: UpdateEducationDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const edu = await candidateRepository.findEducationById(educationId);
    if (!edu) {
      throw new NotFoundError("Education record not found");
    }
    if (edu.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to update this education record");
    }
    const updated = await candidateRepository.updateEducation(educationId, data);
    return candidateMapper.toEducationDto(updated);
  },

  async deleteEducation(userId: string, educationId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const edu = await candidateRepository.findEducationById(educationId);
    if (!edu) {
      throw new NotFoundError("Education record not found");
    }
    if (edu.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to delete this education record");
    }
    await candidateRepository.deleteEducation(educationId);
    return { message: "Education record deleted successfully" };
  },

  // --- Languages ---
  async addLanguage(userId: string, data: CreateLanguageDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const lang = await candidateRepository.createLanguage(candidate.id, data);
    return candidateMapper.toLanguageDto(lang);
  },

  async getLanguages(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const list = await candidateRepository.getLanguages(candidate.id);
    return list.map((item) => candidateMapper.toLanguageDto(item));
  },

  async updateLanguage(userId: string, languageId: string, data: UpdateLanguageDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const lang = await candidateRepository.findLanguageById(languageId);
    if (!lang) {
      throw new NotFoundError("Language record not found");
    }
    if (lang.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to update this language record");
    }
    const updated = await candidateRepository.updateLanguage(languageId, data);
    return candidateMapper.toLanguageDto(updated);
  },

  async deleteLanguage(userId: string, languageId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const lang = await candidateRepository.findLanguageById(languageId);
    if (!lang) {
      throw new NotFoundError("Language record not found");
    }
    if (lang.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to delete this language record");
    }
    await candidateRepository.deleteLanguage(languageId);
    return { message: "Language record deleted successfully" };
  },

  // --- Experience ---
  async addExperience(userId: string, data: CreateExperienceDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const exp = await candidateRepository.createExperience(candidate.id, data);
    return candidateMapper.toExperienceDto(exp);
  },

  async getExperiences(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const list = await candidateRepository.getExperiences(candidate.id);
    return list.map((item) => candidateMapper.toExperienceDto(item));
  },

  async updateExperience(userId: string, experienceId: string, data: UpdateExperienceDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const exp = await candidateRepository.findExperienceById(experienceId);
    if (!exp) {
      throw new NotFoundError("Experience record not found");
    }
    if (exp.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to update this experience record");
    }
    const updated = await candidateRepository.updateExperience(experienceId, data);
    return candidateMapper.toExperienceDto(updated);
  },

  async deleteExperience(userId: string, experienceId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const exp = await candidateRepository.findExperienceById(experienceId);
    if (!exp) {
      throw new NotFoundError("Experience record not found");
    }
    if (exp.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to delete this experience record");
    }
    await candidateRepository.deleteExperience(experienceId);
    return { message: "Experience record deleted successfully" };
  },

  // --- Projects ---
  async addProject(userId: string, data: CreateProjectDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const proj = await candidateRepository.createProject(candidate.id, data);
    return candidateMapper.toProjectDto(proj);
  },

  async getProjects(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const list = await candidateRepository.getProjects(candidate.id);
    return list.map((item) => candidateMapper.toProjectDto(item));
  },

  async updateProject(userId: string, projectId: string, data: UpdateProjectDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const proj = await candidateRepository.findProjectById(projectId);
    if (!proj) {
      throw new NotFoundError("Project record not found");
    }
    if (proj.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to update this project record");
    }
    const updated = await candidateRepository.updateProject(projectId, data);
    return candidateMapper.toProjectDto(updated);
  },

  async deleteProject(userId: string, projectId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const proj = await candidateRepository.findProjectById(projectId);
    if (!proj) {
      throw new NotFoundError("Project record not found");
    }
    if (proj.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to delete this project record");
    }
    await candidateRepository.deleteProject(projectId);
    return { message: "Project record deleted successfully" };
  },

  // --- Certifications ---
  async addCertification(userId: string, data: CreateCertificationDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const cert = await candidateRepository.createCertification(candidate.id, data);
    return candidateMapper.toCertificationDto(cert);
  },

  async getCertifications(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const list = await candidateRepository.getCertifications(candidate.id);
    return list.map((item) => candidateMapper.toCertificationDto(item));
  },

  async updateCertification(userId: string, certificationId: string, data: UpdateCertificationDto) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const cert = await candidateRepository.findCertificationById(certificationId);
    if (!cert) {
      throw new NotFoundError("Certification record not found");
    }
    if (cert.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to update this certification record");
    }
    const updated = await candidateRepository.updateCertification(certificationId, data);
    return candidateMapper.toCertificationDto(updated);
  },

  async deleteCertification(userId: string, certificationId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const cert = await candidateRepository.findCertificationById(certificationId);
    if (!cert) {
      throw new NotFoundError("Certification record not found");
    }
    if (cert.candidateId !== candidate.id) {
      throw new ForbiddenError("You do not have permission to delete this certification record");
    }
    await candidateRepository.deleteCertification(certificationId);
    return { message: "Certification record deleted successfully" };
  },

  // --- Candidate Skills ---
  async getCandidateSkills(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const list = await candidateRepository.getCandidateSkills(candidate.id);
    return list.map((item) => candidateMapper.toSkillDto(item));
  },

  async assignCandidateSkills(userId: string, skillIds: string[]) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    const list = await candidateRepository.assignSkills(candidate.id, skillIds);
    return list.map((item) => candidateMapper.toSkillDto(item));
  },

  async deleteCandidateSkill(userId: string, skillId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    await candidateRepository.deleteSkill(candidate.id, skillId);
    return { message: "Skill removed successfully" };
  },

  // --- Resume Upload, Get, Delete ---
  async uploadResume(userId: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestError("Resume file is required");
    }
    if (file.mimetype !== "application/pdf" && !file.originalname.toLowerCase().endsWith(".pdf")) {
      throw new BadRequestError("Only PDF files are allowed for resume upload");
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestError("Resume file size exceeds maximum limit of 5MB");
    }

    const candidate = await this.getOrCreateCandidateProfile(userId);

    // Save file to uploads/resumes directory
    const uploadDir = path.join(process.cwd(), "uploads", "resumes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${candidate.id}_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, filename);

    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      fs.copyFileSync(file.path, filePath);
    }

    const fileUrl = `/uploads/resumes/${filename}`;
    const updated = await candidateRepository.updateResume(candidate.id, {
      url: fileUrl,
      originalName: file.originalname,
      fileSize: file.size,
      uploadedAt: new Date(),
    });

    return {
      message: "Resume uploaded successfully",
      resume: candidateMapper.toResumeDto(updated),
    };
  },

  async getResume(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    return candidateMapper.toResumeDto(candidate);
  },

  async deleteResume(userId: string) {
    const candidate = await this.getOrCreateCandidateProfile(userId);
    if (!candidate.resumeUrl) {
      throw new NotFoundError("No resume uploaded to delete");
    }
    // Delete file from disk if local upload
    if (candidate.resumeUrl.startsWith("/uploads/resumes/")) {
      const filename = path.basename(candidate.resumeUrl);
      const filePath = path.join(process.cwd(), "uploads", "resumes", filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore file deletion error
        }
      }
    }
    const updated = await candidateRepository.deleteResume(candidate.id);
    return {
      message: "Resume deleted successfully",
      resume: candidateMapper.toResumeDto(updated),
    };
  },

  // --- PDF Resume Generation ---
  async generateResumePdf(userId: string): Promise<Buffer> {
    const candidate = await this.getOrCreateCandidateProfile(userId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const fullName = candidate.user ? candidate.user.fullName : "Candidate Name";
      const email = candidate.user ? candidate.user.email : "";

      // Header
      doc.fontSize(22).fillColor("#1A365D").text(fullName, { align: "left" });
      if (candidate.headline) {
        doc.fontSize(12).fillColor("#4A5568").text(candidate.headline);
      }

      // Contact info line
      const contactParts = [email, candidate.phone, candidate.location].filter(Boolean);
      doc.fontSize(10).fillColor("#718096").text(contactParts.join(" | "));
      if (candidate.linkedinUrl || candidate.githubUrl || candidate.portfolioUrl) {
        const linkParts = [candidate.linkedinUrl, candidate.githubUrl, candidate.portfolioUrl].filter(Boolean);
        doc.text(linkParts.join(" | "));
      }

      doc.moveDown();
      doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);

      // Summary
      if (candidate.summary) {
        doc.fontSize(14).fillColor("#2B6CB0").text("SUMMARY");
        doc.fontSize(10).fillColor("#2D3748").text(candidate.summary);
        doc.moveDown();
      }

      // Key Skills
      if (candidate.skills && candidate.skills.length > 0) {
        doc.fontSize(14).fillColor("#2B6CB0").text("KEY SKILLS");
        const skillNames = candidate.skills.map((s) => s.skill.name).join(", ");
        doc.fontSize(10).fillColor("#2D3748").text(skillNames);
        doc.moveDown();
      }

      // Experience
      const candidateExperiences = candidate.experiences || (candidate as any).candidate_experiences || [];
      if (candidateExperiences.length > 0) {
        doc.fontSize(14).fillColor("#2B6CB0").text("EXPERIENCE / INTERNSHIP");
        for (const exp of candidateExperiences) {
          const dates = `${new Date(exp.startDate).toLocaleDateString()} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}`;
          doc.fontSize(11).fillColor("#1A202C").text(`${exp.designation} at ${exp.companyName} (${exp.type})`);
          doc.fontSize(9).fillColor("#718096").text(dates);
          if (exp.description) {
            doc.fontSize(10).fillColor("#4A5568").text(exp.description);
          }
          if (exp.technologies) {
            doc.fontSize(9).fillColor("#718096").text(`Technologies: ${exp.technologies}`);
          }
          doc.moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Education
      const candidateEducation = candidate.education || (candidate as any).candidate_education || [];
      if (candidateEducation.length > 0) {
        doc.fontSize(14).fillColor("#2B6CB0").text("EDUCATION");
        for (const edu of candidateEducation) {
          const years = [edu.startYear, edu.endYear].filter(Boolean).join(" - ");
          doc.fontSize(11).fillColor("#1A202C").text(`${edu.degree} - ${edu.institution}`);
          if (edu.fieldOfStudy) {
            doc.fontSize(10).fillColor("#4A5568").text(`Field of Study: ${edu.fieldOfStudy}`);
          }
          if (years || edu.grade) {
            doc.fontSize(9).fillColor("#718096").text([years, edu.grade ? `Grade: ${edu.grade} ${edu.gradeType || ""}` : null].filter(Boolean).join(" | "));
          }
          doc.moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Projects
      const candidateProjects = candidate.projects || (candidate as any).candidate_projects || [];
      if (candidateProjects.length > 0) {
        doc.fontSize(14).fillColor("#2B6CB0").text("PROJECTS");
        for (const proj of candidateProjects) {
          doc.fontSize(11).fillColor("#1A202C").text(proj.name);
          if (proj.description) {
            doc.fontSize(10).fillColor("#4A5568").text(proj.description);
          }
          if (proj.technologies) {
            doc.fontSize(9).fillColor("#718096").text(`Technologies: ${proj.technologies}`);
          }
          if (proj.githubUrl || proj.liveUrl) {
            const links = [proj.githubUrl ? `GitHub: ${proj.githubUrl}` : null, proj.liveUrl ? `Live: ${proj.liveUrl}` : null].filter(Boolean).join(" | ");
            doc.fontSize(9).fillColor("#2B6CB0").text(links);
          }
          doc.moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Languages
      const candidateLanguages = candidate.languages || (candidate as any).candidate_languages || [];
      if (candidateLanguages.length > 0) {
        doc.fontSize(14).fillColor("#2B6CB0").text("LANGUAGES");
        const langStrings = candidateLanguages.map((l: any) => {
          const caps = [l.canRead ? "Read" : null, l.canWrite ? "Write" : null, l.canSpeak ? "Speak" : null].filter(Boolean).join("/");
          return `${l.language} (${caps || "Basic"})`;
        });
        doc.fontSize(10).fillColor("#2D3748").text(langStrings.join(", "));
        doc.moveDown();
      }

      // Certifications
      const candidateCertifications = candidate.certifications || (candidate as any).candidate_certifications || [];
      if (candidateCertifications.length > 0) {
        doc.fontSize(14).fillColor("#2B6CB0").text("CERTIFICATIONS");
        for (const cert of candidateCertifications) {
          doc.fontSize(11).fillColor("#1A202C").text(`${cert.name}${cert.issuingOrganization ? ` - ${cert.issuingOrganization}` : ""}`);
          if (cert.issueDate) {
            doc.fontSize(9).fillColor("#718096").text(`Issued: ${new Date(cert.issueDate).toLocaleDateString()}`);
          }
          if (cert.credentialUrl) {
            doc.fontSize(9).fillColor("#2B6CB0").text(`Credential: ${cert.credentialUrl}`);
          }
          doc.moveDown(0.5);
        }
      }

      doc.end();
    });
  },

  // --- Complete View Profile ---
  async getCompleteProfile(candidateIdOrUserId: string) {
    let candidate = await candidateRepository.findById(candidateIdOrUserId);
    if (!candidate) {
      candidate = await candidateRepository.findByUserId(candidateIdOrUserId);
    }
    if (!candidate) {
      throw new NotFoundError("Candidate profile not found");
    }
    return candidateMapper.toCompleteProfileResponse(candidate);
  },

  // --- My Applications ---
  async getMyApplications(userId: string) {
    let candidateId = userId;
    let candidate: any = null;

    try {
      candidate = await this.getOrCreateCandidateProfile(userId);
      if (candidate) {
        candidateId = candidate.id;
      }
    } catch (_e) {
      // Fallback if profile auto-create failed
    }

    const appMap = new Map<string, any>();

    // 1. Query Prisma DB applications
    try {
      const dbApps = await prisma.jobApplication.findMany({
        where: {
          OR: [
            { candidateId: candidateId },
            { candidate: { userId: userId } },
            { candidateId: userId },
          ],
        },
        include: {
          job: {
            include: {
              company: {
                select: { id: true, name: true, logoUrl: true, location: true },
              },
              category: { select: { id: true, name: true } },
            },
          },
          candidate: {
            select: {
              id: true,
              userId: true,
              headline: true,
              phone: true,
              location: true,
              resumeUrl: true,
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      for (const app of dbApps) {
        appMap.set(app.id, {
          ...app,
          jobId: app.jobId,
          candidateId: app.candidateId,
          appliedDate: app.appliedAt,
          status: app.status,
        });
      }
    } catch (_e) {
      // DB query fallback
    }

    // 2. Query repository applications (handles in-memory fallback applications too)
    try {
      const repo = new JobApplicationRepository();
      const repoApps = await repo.findCandidateApplications(candidateId);
      for (const app of repoApps) {
        const dto = JobApplicationMapper.toDto(app);
        if (!appMap.has(dto.id)) {
          appMap.set(dto.id, dto);
        }
      }
      if (candidateId !== userId) {
        const repoAppsUser = await repo.findCandidateApplications(userId);
        for (const app of repoAppsUser) {
          const dto = JobApplicationMapper.toDto(app);
          if (!appMap.has(dto.id)) {
            appMap.set(dto.id, dto);
          }
        }
      }
    } catch (_e) {
      // Repo query fallback
    }

    return Array.from(appMap.values());
  },
};