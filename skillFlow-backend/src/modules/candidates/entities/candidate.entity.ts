import type { WorkType, ExperienceType } from "@prisma/client";

/**
 * Basic user information attached to a candidate.
 */
export interface CandidateUserEntity {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Candidate skill returned with Skill relation.
 */
export interface CandidateSkillEntity {
  id: string;
  candidateId: string;
  skillId: string;

  skill?: {
    id: string;
    name: string;
  };
}

/**
 * Candidate education.
 */
export interface CandidateEducationEntity {
  id: string;
  candidateId: string;

  degree: string;
  institution: string;

  fieldOfStudy: string | null;

  startYear: number | null;
  endYear: number | null;

  grade: string | null;
  gradeType: string | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Candidate language.
 */
export interface CandidateLanguageEntity {
  id: string;
  candidateId: string;

  language: string;

  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Candidate internship / professional experience.
 */
export interface CandidateExperienceEntity {
  id: string;
  candidateId: string;

  type: ExperienceType;

  companyName: string;
  designation: string;

  startDate: Date;
  endDate: Date | null;

  description: string | null;
  technologies: string | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Candidate project.
 */
export interface CandidateProjectEntity {
  id: string;
  candidateId: string;

  name: string;

  description: string | null;
  technologies: string | null;

  startDate: Date | null;
  endDate: Date | null;

  githubUrl: string | null;
  liveUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Candidate certification.
 */
export interface CandidateCertificationEntity {
  id: string;
  candidateId: string;

  name: string;

  issuingOrganization: string | null;

  issueDate: Date | null;

  credentialUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Main CandidateProfile entity.
 */
export interface CandidateEntity {
  id: string;
  userId: string;

  headline: string | null;
  summary: string | null;

  phone: string | null;
  location: string | null;

  experienceYears: number | null;

  preferredWorkType: WorkType | null;
  profilePhotoUrl: string | null; 
  resumeUrl: string | null;
  resumeOriginalName: string | null;
  resumeFileSize: number | null;
  resumeUploadedAt: Date | null;

  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface EducationEntity {
  id: string;
  candidateId: string;
  degree: string;
  institution: string;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  grade: string | null;
  gradeType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LanguageEntity {
  id: string;
  candidateId: string;
  language: string;
  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceEntity {
  id: string;
  candidateId: string;
  type: ExperienceType;
  companyName: string;
  designation: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  technologies: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectEntity {
  id: string;
  candidateId: string;
  name: string;
  description: string | null;
  technologies: string | null;
  startDate: Date | null;
  endDate: Date | null;
  githubUrl: string | null;
  liveUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificationEntity {
  id: string;
  candidateId: string;
  name: string;
  issuingOrganization: string | null;
  issueDate: Date | null;
  credentialUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}