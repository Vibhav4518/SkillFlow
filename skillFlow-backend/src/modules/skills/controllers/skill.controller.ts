import { type Request, type Response, type NextFunction } from "express";
import { SkillService, type ISkillService } from "../services/skill.service.js";
import type { CreateSkillDTO, UpdateSkillDTO } from "../dtos/skill.dto.js";

type SkillParams = {
  skillId: string;
};

export class SkillController {
  constructor(
    private readonly skillService: ISkillService = new SkillService(),
  ) {}

  createSkill = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: CreateSkillDTO = req.body;

      const skill = await this.skillService.createSkill(dto);

      res.status(201).json({
        success: true,
        message: "Skill created successfully",
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  };

  getSkillById = async (
    req: Request<SkillParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { skillId } = req.params;

      const skill = await this.skillService.getSkillById(skillId);

      res.status(200).json({
        success: true,
        message: "Skill fetched successfully",
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllSkills = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const skills = await this.skillService.getAllSkills();

      res.status(200).json({
        success: true,
        message: "Skills fetched successfully",
        data: skills,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSkill = async (
    req: Request<SkillParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { skillId } = req.params;

      const dto: UpdateSkillDTO = req.body;

      const skill = await this.skillService.updateSkill(skillId, dto);

      res.status(200).json({
        success: true,
        message: "Skill updated successfully",
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSkill = async (
    req: Request<SkillParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { skillId } = req.params;

      await this.skillService.deleteSkill(skillId);

      res.status(200).json({
        success: true,
        message: "Skill deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
