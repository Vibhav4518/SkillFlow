import type { SkillEntity } from "../entities/skill.entity.js";
import type { CreateSkillDTO, UpdateSkillDTO } from "../dtos/skill.dto.js";
import {SkillRepository, type ISkillRepository,} from "../repositories/skill.repository.js";

export interface ISkillService {
  getAllSkills(): Promise<SkillEntity[]>;
  getSkillById(id: string): Promise<SkillEntity>;
  createSkill(dto: CreateSkillDTO): Promise<SkillEntity>;
  updateSkill(id: string, dto: UpdateSkillDTO): Promise<SkillEntity>;
  deleteSkill(id: string): Promise<void>;
}

export class SkillService implements ISkillService {
  constructor(
    private readonly skillRepository: ISkillRepository = new SkillRepository(),
  ) {}

  async getAllSkills(): Promise<SkillEntity[]> {
    return this.skillRepository.findAll();
  }

  async getSkillById(id: string): Promise<SkillEntity> {
    const skill = await this.skillRepository.findById(id);

    if (!skill) {
      throw new Error("Skill not found");
    }

    return skill;
  }

  async createSkill(dto: CreateSkillDTO): Promise<SkillEntity> {
    const existingSkill = await this.skillRepository.findByName(dto.name);

    if (existingSkill) {
      throw new Error("Skill already exists");
    }

    return this.skillRepository.create({
      name: dto.name.trim(),
    });
  }

  async updateSkill(id: string, dto: UpdateSkillDTO): Promise<SkillEntity> {
    const existingSkill = await this.skillRepository.findById(id);

    if (!existingSkill) {
      throw new Error("Skill not found");
    }

    if (dto.name) {
      const skillWithSameName = await this.skillRepository.findByName(dto.name);

      if (skillWithSameName && skillWithSameName.id !== id) {
        throw new Error("Skill already exists");
      }
    }

    const updatedSkill = await this.skillRepository.update(id, {
      name: dto.name?.trim(),
    });

    if (!updatedSkill) {
      throw new Error("Failed to update skill");
    }

    return updatedSkill;
  }

  async deleteSkill(id: string): Promise<void> {
    const existingSkill = await this.skillRepository.findById(id);

    if (!existingSkill) {
      throw new Error("Skill not found");
    }

    const deleted = await this.skillRepository.delete(id);

    if (!deleted) {
      throw new Error("Failed to delete skill");
    }
  }
}
