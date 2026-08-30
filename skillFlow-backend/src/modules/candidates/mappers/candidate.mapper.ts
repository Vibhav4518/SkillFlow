import type { CandidateWithRelations } from "../repositories/candidate.repository.js";
import type {
  CandidateProfileResponseDto,
  CandidateBasicDetailsDto,
  EducationResponseDto,
  LanguageResponseDto,
  ExperienceResponseDto,
  ProjectResponseDto,
  CertificationResponseDto,
  SkillResponseDto,
  ResumeResponseDto,
  CompleteCandidateProfileResponseDto,
} from "../dtos/candidate.dto.js";

export const candidateMapper = {
  toProfileResponse(candidate: CandidateWithRelations): CandidateProfileResponseDto {
    const c = candidate as any;
    const skillsList: any[] = Array.isArray(c.skills) ? c.skills : [];
    return {
      id: candidate.id,
      name: candidate.user ? candidate.user.fullName : "",
      email: candidate.user ? candidate.user.email : "",
      phone: candidate.phone,
      location: candidate.location,
      skills: skillsList.map((candidateSkill) => candidateSkill.skill?.name || ""),
    };
  },

  toBasicDetailsDto(candidate: CandidateWithRelations): CandidateBasicDetailsDto {
    return {
      id: candidate.id,
      userId: candidate.userId,
      fullName: candidate.user ? candidate.user.fullName : "",
      email: candidate.user ? candidate.user.email : "",
      phone: candidate.phone,
      location: candidate.location,
      headline: candidate.headline,
      summary: candidate.summary,
      experienceYears: candidate.experienceYears,
      preferredWorkType: candidate.preferredWorkType,
      profilePhotoUrl: candidate.profilePhotoUrl,
      linkedinUrl: candidate.linkedinUrl,
      githubUrl: candidate.githubUrl,
      portfolioUrl: candidate.portfolioUrl,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  },

  toEducationDto(edu: any): EducationResponseDto {
    return {
      id: edu.id,
      degree: edu.degree,
      institution: edu.institution,
      fieldOfStudy: edu.fieldOfStudy ?? null,
      startYear: edu.startYear ?? null,
      endYear: edu.endYear ?? null,
      grade: edu.grade ?? null,
      gradeType: edu.gradeType ?? null,
      createdAt: edu.createdAt,
      updatedAt: edu.updatedAt,
    };
  },

  toLanguageDto(lang: any): LanguageResponseDto {
    return {
      id: lang.id,
      language: lang.language,
      canRead: lang.canRead ?? false,
      canWrite: lang.canWrite ?? false,
      canSpeak: lang.canSpeak ?? false,
      createdAt: lang.createdAt,
      updatedAt: lang.updatedAt,
    };
  },

  toExperienceDto(exp: any): ExperienceResponseDto {
    return {
      id: exp.id,
      type: exp.type,
      companyName: exp.companyName,
      designation: exp.designation,
      startDate: exp.startDate,
      endDate: exp.endDate ?? null,
      description: exp.description ?? null,
      technologies: exp.technologies ?? null,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    };
  },

  toProjectDto(proj: any): ProjectResponseDto {
    return {
      id: proj.id,
      name: proj.name,
      description: proj.description ?? null,
      technologies: proj.technologies ?? null,
      startDate: proj.startDate ?? null,
      endDate: proj.endDate ?? null,
      githubUrl: proj.githubUrl ?? null,
      liveUrl: proj.liveUrl ?? null,
      createdAt: proj.createdAt,
      updatedAt: proj.updatedAt,
    };
  },

  toCertificationDto(cert: any): CertificationResponseDto {
    return {
      id: cert.id,
      name: cert.name,
      issuingOrganization: cert.issuingOrganization ?? null,
      issueDate: cert.issueDate ?? null,
      credentialUrl: cert.credentialUrl ?? null,
      createdAt: cert.createdAt,
      updatedAt: cert.updatedAt,
    };
  },

  toSkillDto(candidateSkill: any): SkillResponseDto {
    return {
      id: candidateSkill.skill ? candidateSkill.skill.id : candidateSkill.skillId || "",
      name: candidateSkill.skill ? candidateSkill.skill.name : "",
    };
  },

  toResumeDto(candidate: CandidateWithRelations): ResumeResponseDto {
    return {
      url: candidate.resumeUrl ?? null,
      originalName: candidate.resumeOriginalName ?? null,
      fileSize: candidate.resumeFileSize ?? null,
      uploadedAt: candidate.resumeUploadedAt ?? null,
    };
  },

  toCompleteProfileResponse(candidate: CandidateWithRelations): CompleteCandidateProfileResponseDto {
    const c = candidate as any;
    const educationList: any[] = Array.isArray(c.education) ? c.education : Array.isArray(c.candidate_education) ? c.candidate_education : [];
    const languageList: any[] = Array.isArray(c.languages) ? c.languages : Array.isArray(c.candidate_languages) ? c.candidate_languages : [];
    const experienceList: any[] = Array.isArray(c.experiences) ? c.experiences : Array.isArray(c.candidate_experiences) ? c.candidate_experiences : [];
    const projectList: any[] = Array.isArray(c.projects) ? c.projects : Array.isArray(c.candidate_projects) ? c.candidate_projects : [];
    const certificationList: any[] = Array.isArray(c.certifications) ? c.certifications : Array.isArray(c.candidate_certifications) ? c.candidate_certifications : [];
    const skillList: any[] = Array.isArray(c.skills) ? c.skills : [];

    return {
      basicDetails: candidateMapper.toBasicDetailsDto(candidate),
      skills: skillList.map((cs) => candidateMapper.toSkillDto(cs)),
      education: educationList.map((edu) => candidateMapper.toEducationDto(edu)),
      languages: languageList.map((lang) => candidateMapper.toLanguageDto(lang)),
      experience: experienceList.map((exp) => candidateMapper.toExperienceDto(exp)),
      projects: projectList.map((proj) => candidateMapper.toProjectDto(proj)),
      certifications: certificationList.map((cert) => candidateMapper.toCertificationDto(cert)),
      resume: candidateMapper.toResumeDto(candidate),
    };
  },
};