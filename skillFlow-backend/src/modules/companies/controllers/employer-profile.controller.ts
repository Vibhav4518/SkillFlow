import { type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.js";
import { EmployerProfileService, type IEmployerProfileService } from "../services/employer-profile.service.js";
import type { CreateEmployerProfileDTO, UpdateEmployerProfileDTO } from "../dtos/employer-profile.dto.js";

export class EmployerProfileController {
  constructor(
    private readonly employerProfileService: IEmployerProfileService = new EmployerProfileService(),
  ) {}

  createProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const dto: CreateEmployerProfileDTO = req.body;

      const profile = await this.employerProfileService.createEmployerProfile(userId!, dto);

      res.status(201).json({
        success: true,
        message: "Employer profile created successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;

      const profile = await this.employerProfileService.getProfileByUserId(userId!);

      res.status(200).json({
        success: true,
        message: "Employer profile fetched successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const dto: UpdateEmployerProfileDTO = req.body;

      const profile = await this.employerProfileService.updateEmployerProfile(userId!, dto);

      res.status(200).json({
        success: true,
        message: "Employer profile updated successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };
}
