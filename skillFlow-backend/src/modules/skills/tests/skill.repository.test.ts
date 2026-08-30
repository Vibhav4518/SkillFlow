import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { SkillRepository } from '../repositories/skill.repository.js';

import type { IDatabaseClient } from '../../../infrastructure/database/db.client.js';


describe('SkillRepository', () => {
  let repository: SkillRepository;

  let mockDb: {
    query: ReturnType<typeof vi.fn>;
    queryOne: ReturnType<typeof vi.fn>;
    execute: ReturnType<typeof vi.fn>;
  };


  beforeEach(() => {
    mockDb = {
      query: vi.fn(),
      queryOne: vi.fn(),
      execute: vi.fn(),
    };

    repository = new SkillRepository(
      mockDb as unknown as IDatabaseClient,
    );
  });


  describe('findAll', () => {
    it('should return all skills', async () => {
      const skills = [
        {
          id: 'skill-1',
          name: 'TypeScript',
        },
        {
          id: 'skill-2',
          name: 'Node.js',
        },
      ];

      mockDb.query.mockResolvedValue(skills);

      const result = await repository.findAll();

      expect(mockDb.query).toHaveBeenCalledOnce();

      expect(result).toEqual(skills);
    });


    it('should return empty array when no skills exist', async () => {
      mockDb.query.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });


  describe('findById', () => {
    it('should return skill when id exists', async () => {
      const skill = {
        id: 'skill-1',
        name: 'TypeScript',
      };

      mockDb.queryOne.mockResolvedValue(skill);

      const result =
        await repository.findById('skill-1');

      expect(mockDb.queryOne).toHaveBeenCalled();

      expect(result).toEqual(skill);
    });


    it('should return null when id does not exist', async () => {
      mockDb.queryOne.mockResolvedValue(null);

      const result =
        await repository.findById('invalid-id');

      expect(result).toBeNull();
    });
  });


  describe('findByName', () => {
    it('should return skill when name exists', async () => {
      const skill = {
        id: 'skill-1',
        name: 'TypeScript',
      };

      mockDb.queryOne.mockResolvedValue(skill);

      const result =
        await repository.findByName('TypeScript');

      expect(result).toEqual(skill);
    });


    it('should pass skill name to database query', async () => {
      mockDb.queryOne.mockResolvedValue(null);

      await repository.findByName('React');

      expect(mockDb.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(name)'),
        ['React'],
      );
    });


    it('should return null when skill does not exist', async () => {
      mockDb.queryOne.mockResolvedValue(null);

      const result =
        await repository.findByName('Unknown');

      expect(result).toBeNull();
    });
  });


  describe('create', () => {
    it('should create and return a skill', async () => {
      const skill = {
        id: 'skill-1',
        name: 'TypeScript',
      };

      mockDb.queryOne.mockResolvedValue(skill);

      const result = await repository.create({
        name: 'TypeScript',
      });

      expect(mockDb.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO skills'),
        ['TypeScript'],
      );

      expect(result).toEqual(skill);
    });


    it('should use gen_random_uuid when creating skill', async () => {
      mockDb.queryOne.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      await repository.create({
        name: 'TypeScript',
      });

      expect(mockDb.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('gen_random_uuid()'),
        ['TypeScript'],
      );
    });


    it('should throw when database does not return created skill', async () => {
      mockDb.queryOne.mockResolvedValue(null);

      await expect(
        repository.create({
          name: 'TypeScript',
        }),
      ).rejects.toThrow('Failed to create skill');
    });
  });


  describe('update', () => {
    it('should update and return skill', async () => {
      const updatedSkill = {
        id: 'skill-1',
        name: 'Advanced TypeScript',
      };

      mockDb.queryOne.mockResolvedValue(
        updatedSkill,
      );

      const result = await repository.update(
        'skill-1',
        {
          name: 'Advanced TypeScript',
        },
      );

      expect(mockDb.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE skills'),
        [
          'skill-1',
          'Advanced TypeScript',
        ],
      );

      expect(result).toEqual(updatedSkill);
    });


    it('should return null when skill does not exist', async () => {
      mockDb.queryOne.mockResolvedValue(null);

      const result = await repository.update(
        'invalid-id',
        {
          name: 'React',
        },
      );

      expect(result).toBeNull();
    });
  });


  describe('delete', () => {
    it('should return true when skill is deleted', async () => {
      mockDb.execute.mockResolvedValue(1);

      const result =
        await repository.delete('skill-1');

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM skills'),
        ['skill-1'],
      );

      expect(result).toBe(true);
    });


    it('should return false when skill does not exist', async () => {
      mockDb.execute.mockResolvedValue(0);

      const result =
        await repository.delete('invalid-id');

      expect(result).toBe(false);
    });
  });
});