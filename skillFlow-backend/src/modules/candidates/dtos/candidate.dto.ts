export interface UpdateCandidateProfileDto {
  fullName?: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  preferredWorkType?: 'REMOTE' | 'ONSITE' | 'HYBRID';
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  profilePhotoUrl?: string;
}
 
export interface CreateEducationDto {
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  gradeType?: string;
}

export interface UpdateEducationDto {
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  gradeType?: string;
}

export interface CreateLanguageDto {
  language: string;
  canRead?: boolean;
  canWrite?: boolean;
  canSpeak?: boolean;
}

export interface UpdateLanguageDto {
  language?: string;
  canRead?: boolean;
  canWrite?: boolean;
  canSpeak?: boolean;
}

export interface CreateExperienceDto {
  type: 'INTERNSHIP' | 'EXPERIENCE';
  companyName: string;
  designation: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
  technologies?: string;
}

export interface UpdateExperienceDto {
  type?: 'INTERNSHIP' | 'EXPERIENCE';
  companyName?: string;
  designation?: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
  technologies?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  technologies?: string;
  startDate?: string;
  endDate?: string | null;
  githubUrl?: string;
  liveUrl?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  technologies?: string;
  startDate?: string;
  endDate?: string | null;
  githubUrl?: string;
  liveUrl?: string;
}

export interface CreateCertificationDto {
  name: string;
  issuingOrganization?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface UpdateCertificationDto {
  name?: string;
  issuingOrganization?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface AssignCandidateSkillsDto {
  skillIds: string[];
}

export interface EducationResponseDto {
  id: string;
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

export interface LanguageResponseDto {
  id: string;
  language: string;
  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceResponseDto {
  id: string;
  type: 'INTERNSHIP' | 'EXPERIENCE';
  companyName: string;
  designation: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  technologies: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectResponseDto {
  id: string;
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

export interface CertificationResponseDto {
  id: string;
  name: string;
  issuingOrganization: string | null;
  issueDate: Date | null;
  credentialUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillResponseDto {
  id: string;
  name: string;
}

export interface ResumeResponseDto {
  url: string | null;
  originalName: string | null;
  fileSize: number | null;
  uploadedAt: Date | null;
}

export interface CandidateBasicDetailsDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  experienceYears: number | null;
  preferredWorkType: 'REMOTE' | 'ONSITE' | 'HYBRID' | null;
  profilePhotoUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateProfileResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  skills: string[];
}

export interface CompleteCandidateProfileResponseDto {
  basicDetails: CandidateBasicDetailsDto;
  skills: SkillResponseDto[];
  education: EducationResponseDto[];
  languages: LanguageResponseDto[];
  experience: ExperienceResponseDto[];
  projects: ProjectResponseDto[];
  certifications: CertificationResponseDto[];
  resume: ResumeResponseDto;
}