import type { Response } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.js";
import { candidateService } from "../services/candidate.service.js";

export const candidateController = {
  // --- Basic Profile ---
  async getMyProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const candidate = await candidateService.getMyProfile(userId);
    return res.status(200).json({ 
      success: true,
      data: candidate,
    });
  },

  async getBasicProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const basicProfile = await candidateService.getBasicProfile(userId);
    return res.status(200).json({
      success: true,
      data: basicProfile,
    });
  },

  async updateBasicProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const updated = await candidateService.updateBasicProfile(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Candidate basic profile updated successfully",
      data: updated,
    });
  },

  // --- Education ---
  async addEducation(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const education = await candidateService.addEducation(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Education added successfully",
      data: education,
    });
  },

  async getEducation(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const educationList = await candidateService.getEducation(userId);
    return res.status(200).json({
      success: true,
      data: educationList,
    });
  },

  async updateEducation(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { educationId } = req.params;
    const updated = await candidateService.updateEducation(userId, educationId as string, req.body);
    return res.status(200).json({
      success: true,
      message: "Education updated successfully",
      data: updated,
    });
  },

  async deleteEducation(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { educationId } = req.params;
    const result = await candidateService.deleteEducation(userId, educationId as string);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  },

  // --- Languages ---
  async addLanguage(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const language = await candidateService.addLanguage(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Language added successfully",
      data: language,
    });
  },

  async getLanguages(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const languages = await candidateService.getLanguages(userId);
    return res.status(200).json({
      success: true,
      data: languages,
    });
  },

  async updateLanguage(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { languageId } = req.params;
    const updated = await candidateService.updateLanguage(userId, languageId as string, req.body);
    return res.status(200).json({
      success: true,
      message: "Language updated successfully",
      data: updated,
    });
  },

  async deleteLanguage(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { languageId } = req.params;
    const result = await candidateService.deleteLanguage(userId, languageId as string);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  },

  // --- Experience ---
  async addExperience(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const experience = await candidateService.addExperience(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Experience record added successfully",
      data: experience,
    });
  },

  async getExperiences(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const experiences = await candidateService.getExperiences(userId);
    return res.status(200).json({
      success: true,
      data: experiences,
    });
  },

  async updateExperience(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { experienceId } = req.params;
    const updated = await candidateService.updateExperience(userId, experienceId as string, req.body);
    return res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      data: updated,
    });
  },

  async deleteExperience(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { experienceId } = req.params;
    const result = await candidateService.deleteExperience(userId, experienceId as string);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  },

  // --- Projects ---
  async addProject(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const project = await candidateService.addProject(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Project added successfully",
      data: project,
    });
  },

  async getProjects(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const projects = await candidateService.getProjects(userId);
    return res.status(200).json({
      success: true,
      data: projects,
    });
  },

  async updateProject(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { projectId } = req.params;
    const updated = await candidateService.updateProject(userId, projectId as string, req.body);
    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  },

  async deleteProject(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { projectId } = req.params;
    const result = await candidateService.deleteProject(userId, projectId as string);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  },

  // --- Certifications ---
  async addCertification(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const certification = await candidateService.addCertification(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Certification added successfully",
      data: certification,
    });
  },

  async getCertifications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const certifications = await candidateService.getCertifications(userId);
    return res.status(200).json({
      success: true,
      data: certifications,
    });
  },

  async updateCertification(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { certificationId } = req.params;
    const updated = await candidateService.updateCertification(userId, certificationId as string, req.body);
    return res.status(200).json({
      success: true,
      message: "Certification updated successfully",
      data: updated,
    });
  },

  async deleteCertification(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { certificationId } = req.params;
    const result = await candidateService.deleteCertification(userId, certificationId as string);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  },

  // --- Skills ---
  async getCandidateSkills(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const skills = await candidateService.getCandidateSkills(userId);
    return res.status(200).json({
      success: true,
      data: skills,
    });
  },

  async assignCandidateSkills(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { skillIds } = req.body;
    const skills = await candidateService.assignCandidateSkills(userId, skillIds);
    return res.status(200).json({
      success: true,
      message: "Candidate skills updated successfully",
      data: skills,
    });
  },

  async deleteCandidateSkill(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { skillId } = req.params;
    const result = await candidateService.deleteCandidateSkill(userId, skillId as string);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  },

  // --- Resume Upload, Get, Delete ---
  async uploadResume(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const result = await candidateService.uploadResume(userId, req.file);
    return res.status(200).json({
      success: true,
      message: result.message,
      resume: result.resume,
    });
  },

  async getResume(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const resume = await candidateService.getResume(userId);
    return res.status(200).json({
      success: true,
      data: resume,
    });
  },

  async deleteResume(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const result = await candidateService.deleteResume(userId);
    return res.status(200).json({
      success: true,
      message: result.message,
      resume: result.resume,
    });
  },

  // --- PDF Resume Generation ---
  async generateResumePdf(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const pdfBuffer = await candidateService.generateResumePdf(userId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="resume.pdf"');
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.status(200).send(pdfBuffer);
  },

  // --- Complete View Profile ---
  async getCompleteProfile(req: AuthenticatedRequest, res: Response) {
    const { candidateId } = req.params;
    const completeProfile = await candidateService.getCompleteProfile(candidateId as string);
    return res.status(200).json({
      success: true,
      data: completeProfile,
    });
  },

  // --- My Applications ---
  async getMyApplications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const applications = await candidateService.getMyApplications(userId);
    return res.status(200).json({
      success: true,
      data: applications,
    });
  },
};