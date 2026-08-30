import { type Request, type Response, type NextFunction } from "express";
import {CompanyService, type ICompanyService,} from "../services/company.service.js";
import type {CreateCompanyDTO, UpdateCompanyDTO, UpdateCompanyVerificationDTO,} from "../dtos/company.dto.js";

type CompanyParams = {
  companyId: string;
};

export class CompanyController {
  constructor(
    private readonly companyService: ICompanyService = new CompanyService(),
  ) { }

  createCompany = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: CreateCompanyDTO = req.body;

      const company = await this.companyService.createCompany(dto);

      res.status(201).json({
        success: true,
        message: "Company created successfully",
        data: company,
      });
    } catch (error) {
      next(error);
    }
  };

  getCompanyById = async (
    req: Request<CompanyParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { companyId } = req.params;

      const company = await this.companyService.getCompanyById(companyId);

      res.status(200).json({
        success: true,
        message: "Company fetched successfully",
        data: company,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllCompanies = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const companies = await this.companyService.getAllCompanies();

      res.status(200).json({
        success: true,
        message: "Companies fetched successfully",
        data: companies,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCompany = async (
    req: Request<CompanyParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { companyId } = req.params;

      const dto: UpdateCompanyDTO = req.body;

      const company = await this.companyService.updateCompany(companyId, dto);

      res.status(200).json({
        success: true,
        message: "Company updated successfully",
        data: company,
      });
    } catch (error) {
      next(error);
    }
  };

  updateVerificationStatus = async (
    req: Request<CompanyParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { companyId } = req.params;

      const dto: UpdateCompanyVerificationDTO = req.body;

      const company = await this.companyService.updateVerificationStatus(
        companyId,
        dto,
      );

      res.status(200).json({
        success: true,
        message: "Company verification status updated successfully",
        data: company,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCompany = async (
    req: Request<CompanyParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { companyId } = req.params;

      await this.companyService.deleteCompany(companyId);

      res.status(200).json({
        success: true,
        message: "Company deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  addCompanyEmployer = async (
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const profile = await (this.companyService as any).addCompanyEmployer(userId, req.body);
      res.status(201).json({
        success: true,
        message: "Employer account created successfully for your company",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  getCompanyEmployers = async (
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const employers = await (this.companyService as any).getCompanyEmployers(userId);
      res.status(200).json({
        success: true,
        data: employers,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleEmployerStatus = async (
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const { employerProfileId } = req.params;
      const { isActive } = req.body;
      const updated = await (this.companyService as any).toggleEmployerStatus(userId, employerProfileId, isActive);
      res.status(200).json({
        success: true,
        message: `Employer status updated to ${isActive ? 'Active' : 'Inactive'}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}
