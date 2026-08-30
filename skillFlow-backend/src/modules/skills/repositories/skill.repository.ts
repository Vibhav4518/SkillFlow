import {db, type IDatabaseClient,} from "../../../infrastructure/database/db.client.js";
import type { SkillEntity } from "../entities/skill.entity.js";
import type { CreateSkillDTO, UpdateSkillDTO } from "../dtos/skill.dto.js";

export interface ISkillRepository {
  findAll(): Promise<SkillEntity[]>;

  findById(id: string): Promise<SkillEntity | null>;

  findByName(name: string): Promise<SkillEntity | null>;

  create(dto: CreateSkillDTO): Promise<SkillEntity>;

  update(id: string, dto: UpdateSkillDTO): Promise<SkillEntity | null>;

  delete(id: string): Promise<boolean>;
}

export class SkillRepository implements ISkillRepository {
  constructor(private readonly client: IDatabaseClient = db) {}

  async findAll(): Promise<SkillEntity[]> {
    return this.client.query<SkillEntity>(
      `
        SELECT
          id,
          name
        FROM skills
        ORDER BY name ASC;
      `,
    );
  }

  async findById(id: string): Promise<SkillEntity | null> {
    return this.client.queryOne<SkillEntity>(
      `
        SELECT
          id,
          name
        FROM skills
        WHERE id = $1
        LIMIT 1;
      `,
      [id],
    );
  }

  async findByName(name: string): Promise<SkillEntity | null> {
    return this.client.queryOne<SkillEntity>(
      `
        SELECT
          id,
          name
        FROM skills
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1;
      `,
      [name],
    );
  }

  async create(dto: CreateSkillDTO): Promise<SkillEntity> {
    const skill = await this.client.queryOne<SkillEntity>(
      `
        INSERT INTO skills (
          id,
          name
        )
        VALUES (
          gen_random_uuid(),
          $1
        )
        RETURNING
          id,
          name;
      `,
      [dto.name],
    );

    if (!skill) {
      throw new Error("Failed to create skill");
    }

    return skill;
  }

  async update(id: string, dto: UpdateSkillDTO): Promise<SkillEntity | null> {
    return this.client.queryOne<SkillEntity>(
      `
        UPDATE skills
        SET
          name = COALESCE($2, name)
        WHERE id = $1
        RETURNING
          id,
          name;
      `,
      [id, dto.name ?? null],
    );
  }

  async delete(id: string): Promise<boolean> {
    const affectedRows = await this.client.execute(
      `
        DELETE FROM skills
        WHERE id = $1;
      `,
      [id],
    );

    return affectedRows > 0;
  }
}
