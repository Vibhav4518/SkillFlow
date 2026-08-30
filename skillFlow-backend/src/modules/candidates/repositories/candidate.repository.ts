import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";
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

export type CandidateWithRelations = Prisma.CandidateProfileGetPayload<{
  include: {
    user: true;
    skills: {
      include: {
        skill: true;
      };
    };
    education: true;
    languages: true;
    experiences: true;
    projects: true;
    certifications: true;
  };
}>;

const defaultInclude = {
  user: true,
  skills: {
    include: {
      skill: true,
    },
  },
  education: {
    orderBy: { createdAt: "desc" as const },
  },
  languages: {
    orderBy: { createdAt: "desc" as const },
  },
  experiences: {
    orderBy: { startDate: "desc" as const },
  },
  projects: {
    orderBy: { createdAt: "desc" as const },
  },
  certifications: {
    orderBy: { createdAt: "desc" as const },
  },
};

export const candidateRepository = {
  async findByUserId(userId: string): Promise<CandidateWithRelations | null> {
    return prisma.candidateProfile.findUnique({
      where: { userId },
      include: defaultInclude,
    });
  },

  async findById(candidateId: string): Promise<CandidateWithRelations | null> {
    return prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: defaultInclude,
    });
  },

  async updateProfile(candidateId: string, data: UpdateCandidateProfileDto) {
    if (data.fullName) {
      const candidate = await prisma.candidateProfile.findUnique({ where: { id: candidateId } });
      if (candidate?.userId) {
        await prisma.user.update({
          where: { id: candidate.userId },
          data: { fullName: data.fullName },
        });
      }
    }

    if (Array.isArray((data as any).skills)) {
      const rawSkills: any[] = (data as any).skills;
      const skillNamesOrIds = rawSkills.map((s) => (typeof s === "string" ? s : s?.name || s?.id || "")).filter(Boolean);
      await this.assignSkills(candidateId, skillNamesOrIds);
    }

    return prisma.candidateProfile.update({
      where: { id: candidateId },
      data: {
        ...(data.headline !== undefined && { headline: data.headline }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.preferredWorkType !== undefined && { preferredWorkType: data.preferredWorkType }),
        ...(data.linkedinUrl !== undefined && { linkedinUrl: data.linkedinUrl }),
        ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
        ...(data.portfolioUrl !== undefined && { portfolioUrl: data.portfolioUrl }),
        ...(data.profilePhotoUrl !== undefined && { profilePhotoUrl: data.profilePhotoUrl }),
      },
      include: defaultInclude,
    });
  },

  // --- Education ---
  async createEducation(candidateId: string, data: CreateEducationDto) {
    return prisma.education.create({
      data: {
        id: crypto.randomUUID(),
        candidateId,
        degree: data.degree,
        institution: data.institution,
        fieldOfStudy: data.fieldOfStudy || null,
        startYear: data.startYear || null,
        endYear: data.endYear || null,
        grade: data.grade || null,
        gradeType: data.gradeType || null,
        updatedAt: new Date(),
      },
    });
  },

  async getEducation(candidateId: string) {
    return prisma.education.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findEducationById(educationId: string) {
    return prisma.education.findUnique({
      where: { id: educationId },
    });
  },

  async updateEducation(educationId: string, data: UpdateEducationDto) {
    return prisma.education.update({
      where: { id: educationId },
      data: {
        ...(data.degree !== undefined && { degree: data.degree }),
        ...(data.institution !== undefined && { institution: data.institution }),
        ...(data.fieldOfStudy !== undefined && { fieldOfStudy: data.fieldOfStudy }),
        ...(data.startYear !== undefined && { startYear: data.startYear }),
        ...(data.endYear !== undefined && { endYear: data.endYear }),
        ...(data.grade !== undefined && { grade: data.grade }),
        ...(data.gradeType !== undefined && { gradeType: data.gradeType }),
        updatedAt: new Date(),
      },
    });
  },

  async deleteEducation(educationId: string) {
    return prisma.education.delete({
      where: { id: educationId },
    });
  },

  // --- Languages ---
  async createLanguage(candidateId: string, data: CreateLanguageDto) {
    return prisma.candidateLanguage.create({
      data: {
        id: crypto.randomUUID(),
        candidateId,
        language: data.language,
        canRead: data.canRead ?? false,
        canWrite: data.canWrite ?? false,
        canSpeak: data.canSpeak ?? false,
        updatedAt: new Date(),
      },
    });
  },

  async getLanguages(candidateId: string) {
    return prisma.candidateLanguage.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findLanguageById(languageId: string) {
    return prisma.candidateLanguage.findUnique({
      where: { id: languageId },
    });
  },

  async updateLanguage(languageId: string, data: UpdateLanguageDto) {
    return prisma.candidateLanguage.update({
      where: { id: languageId },
      data: {
        ...(data.language !== undefined && { language: data.language }),
        ...(data.canRead !== undefined && { canRead: data.canRead }),
        ...(data.canWrite !== undefined && { canWrite: data.canWrite }),
        ...(data.canSpeak !== undefined && { canSpeak: data.canSpeak }),
        updatedAt: new Date(),
      },
    });
  },

  async deleteLanguage(languageId: string) {
    return prisma.candidateLanguage.delete({
      where: { id: languageId },
    });
  },

  // --- Experience ---
  async createExperience(candidateId: string, data: CreateExperienceDto) {
    const d = data as any;
    return prisma.candidateExperience.create({
      data: {
        id: crypto.randomUUID(),
        candidateId,
        type: (d.type as any) || "EXPERIENCE",
        companyName: d.companyName || d.company || "Company",
        designation: d.designation || d.title || "Role",
        startDate: new Date(d.startDate),
        endDate: d.endDate ? new Date(d.endDate) : null,
        description: d.description || null,
        technologies: d.technologies || null,
        updatedAt: new Date(),
      },
    });
  },

  async getExperiences(candidateId: string) {
    return prisma.candidateExperience.findMany({
      where: { candidateId },
      orderBy: { startDate: "desc" },
    });
  },

  async findExperienceById(experienceId: string) {
    return prisma.candidateExperience.findUnique({
      where: { id: experienceId },
    });
  },

  async updateExperience(experienceId: string, data: UpdateExperienceDto) {
    return prisma.candidateExperience.update({
      where: { id: experienceId },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.designation !== undefined && { designation: data.designation }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.technologies !== undefined && { technologies: data.technologies }),
        updatedAt: new Date(),
      },
    });
  },

  async deleteExperience(experienceId: string) {
    return prisma.candidateExperience.delete({
      where: { id: experienceId },
    });
  },

  // --- Projects ---
  async createProject(candidateId: string, data: CreateProjectDto) {
    return prisma.candidateProject.create({
      data: {
        id: crypto.randomUUID(),
        candidateId,
        name: data.name,
        description: data.description || null,
        technologies: data.technologies || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        githubUrl: data.githubUrl || null,
        liveUrl: data.liveUrl || null,
        updatedAt: new Date(),
      },
    });
  },

  async getProjects(candidateId: string) {
    return prisma.candidateProject.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findProjectById(projectId: string) {
    return prisma.candidateProject.findUnique({
      where: { id: projectId },
    });
  },

  async updateProject(projectId: string, data: UpdateProjectDto) {
    return prisma.candidateProject.update({
      where: { id: projectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.technologies !== undefined && { technologies: data.technologies }),
        ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
        ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl }),
        updatedAt: new Date(),
      },
    });
  },

  async deleteProject(projectId: string) {
    return prisma.candidateProject.delete({
      where: { id: projectId },
    });
  },

  // --- Certifications ---
  async createCertification(candidateId: string, data: CreateCertificationDto) {
    return prisma.candidateCertification.create({
      data: {
        id: crypto.randomUUID(),
        candidateId,
        name: data.name,
        issuingOrganization: data.issuingOrganization || null,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        credentialUrl: data.credentialUrl || null,
        updatedAt: new Date(),
      },
    });
  },

  async getCertifications(candidateId: string) {
    return prisma.candidateCertification.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findCertificationById(certificationId: string) {
    return prisma.candidateCertification.findUnique({
      where: { id: certificationId },
    });
  },

  async updateCertification(certificationId: string, data: UpdateCertificationDto) {
    return prisma.candidateCertification.update({
      where: { id: certificationId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.issuingOrganization !== undefined && { issuingOrganization: data.issuingOrganization }),
        ...(data.issueDate !== undefined && { issueDate: data.issueDate ? new Date(data.issueDate) : null }),
        ...(data.credentialUrl !== undefined && { credentialUrl: data.credentialUrl }),
        updatedAt: new Date(),
      },
    });
  },

  async deleteCertification(certificationId: string) {
    return prisma.candidateCertification.delete({
      where: { id: certificationId },
    });
  },

  // --- Skills ---
  async getCandidateSkills(candidateId: string) {
    return prisma.candidateSkill.findMany({
      where: { candidateId },
      include: { skill: true },
    });
  },

  async assignSkills(candidateId: string, skillNamesOrIds: string[]) {
    const resolvedSkillIds: string[] = [];
    for (const input of skillNamesOrIds) {
      if (!input || typeof input !== "string") continue;
      const trimmed = input.trim();
      if (!trimmed) continue;

      let skill = await prisma.skill.findFirst({
        where: {
          OR: [
            { id: trimmed },
            { name: { equals: trimmed, mode: "insensitive" } },
          ],
        },
      });

      if (!skill) {
        skill = await prisma.skill.create({
          data: {
            id: crypto.randomUUID(),
            name: trimmed,
          },
        });
      }
      resolvedSkillIds.push(skill.id);
    }

    if (resolvedSkillIds.length > 0) {
      await prisma.candidateSkill.createMany({
        data: resolvedSkillIds.map((skillId) => ({ candidateId, skillId })),
        skipDuplicates: true,
      });
    }

    return this.getCandidateSkills(candidateId);
  },

  async deleteSkill(candidateId: string, skillIdOrName: string) {
    const trimmed = skillIdOrName.trim();
    const matchingSkills = await prisma.skill.findMany({
      where: {
        OR: [
          { id: trimmed },
          { name: { equals: trimmed, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    const skillIds = matchingSkills.map((s) => s.id);
    if (skillIds.length === 0) skillIds.push(trimmed);

    return prisma.candidateSkill.deleteMany({
      where: {
        candidateId,
        skillId: { in: skillIds },
      },
    });
  },

  // --- Resume ---
  async updateResume(
    candidateId: string,
    resumeData: { url: string; originalName: string; fileSize: number; uploadedAt: Date }
  ) {
    return prisma.candidateProfile.update({
      where: { id: candidateId },
      data: {
        resumeUrl: resumeData.url,
        resumeOriginalName: resumeData.originalName,
        resumeFileSize: resumeData.fileSize,
        resumeUploadedAt: resumeData.uploadedAt,
      },
      include: defaultInclude,
    });
  },

  async deleteResume(candidateId: string) {
    return prisma.candidateProfile.update({
      where: { id: candidateId },
      data: {
        resumeUrl: null,
        resumeOriginalName: null,
        resumeFileSize: null,
        resumeUploadedAt: null,
      },
      include: defaultInclude,
    });
  },
};