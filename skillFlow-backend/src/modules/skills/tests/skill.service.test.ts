import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { SkillService } from '../services/skill.service.js';

import type { ISkillRepository } from '../repositories/skill.repository.js';


describe('SkillService', () => {
  let service: SkillService;

  let repository: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByName: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };


  beforeEach(() => {
    repository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = new SkillService(
      repository as unknown as ISkillRepository,
    );
  });


  describe('getAllSkills', () => {
    it('should return all skills', async () => {
      const skills = [
        {
          id: 'skill-1',
          name: 'TypeScript',
        },
      ];

      repository.findAll.mockResolvedValue(skills);

      const result =
        await service.getAllSkills();

      expect(repository.findAll)
        .toHaveBeenCalledOnce();

      expect(result).toEqual(skills);
    });
  });


  describe('getSkillById', () => {
    it('should return skill when it exists', async () => {
      const skill = {
        id: 'skill-1',
        name: 'TypeScript',
      };

      repository.findById.mockResolvedValue(skill);

      const result =
        await service.getSkillById('skill-1');

      expect(result).toEqual(skill);
    });


    it('should throw when skill does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.getSkillById('invalid-id'),
      ).rejects.toThrow('Skill not found');
    });
  });


  describe('createSkill', () => {
    it('should create a new skill', async () => {
      repository.findByName.mockResolvedValue(null);

      repository.create.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      const result =
        await service.createSkill({
          name: 'TypeScript',
        });

      expect(repository.create)
        .toHaveBeenCalledWith({
          name: 'TypeScript',
        });

      expect(result).toEqual({
        id: 'skill-1',
        name: 'TypeScript',
      });
    });


    it('should trim skill name before creating', async () => {
      repository.findByName.mockResolvedValue(null);

      repository.create.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      await service.createSkill({
        name: '   TypeScript   ',
      });

      expect(repository.create)
        .toHaveBeenCalledWith({
          name: 'TypeScript',
        });
    });


    it('should throw when skill already exists', async () => {
      repository.findByName.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      await expect(
        service.createSkill({
          name: 'TypeScript',
        }),
      ).rejects.toThrow(
        'Skill already exists',
      );

      expect(repository.create)
        .not.toHaveBeenCalled();
    });
  });


  describe('updateSkill', () => {
    it('should update existing skill', async () => {
      repository.findById.mockResolvedValue({
        id: 'skill-1',
        name: 'JavaScript',
      });

      repository.findByName.mockResolvedValue(null);

      repository.update.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      const result =
        await service.updateSkill(
          'skill-1',
          {
            name: 'TypeScript',
          },
        );

      expect(result).toEqual({
        id: 'skill-1',
        name: 'TypeScript',
      });
    });


    it('should throw when skill does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateSkill(
          'invalid-id',
          {
            name: 'React',
          },
        ),
      ).rejects.toThrow('Skill not found');

      expect(repository.update)
        .not.toHaveBeenCalled();
    });


    it('should reject duplicate skill name', async () => {
      repository.findById.mockResolvedValue({
        id: 'skill-1',
        name: 'JavaScript',
      });

      repository.findByName.mockResolvedValue({
        id: 'skill-2',
        name: 'TypeScript',
      });

      await expect(
        service.updateSkill(
          'skill-1',
          {
            name: 'TypeScript',
          },
        ),
      ).rejects.toThrow(
        'Skill already exists',
      );

      expect(repository.update)
        .not.toHaveBeenCalled();
    });


    it('should allow same skill name for same id', async () => {
      repository.findById.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      repository.findByName.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      repository.update.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      await service.updateSkill(
        'skill-1',
        {
          name: 'TypeScript',
        },
      );

      expect(repository.update)
        .toHaveBeenCalled();
    });


    it('should throw when repository update fails', async () => {
      repository.findById.mockResolvedValue({
        id: 'skill-1',
        name: 'JavaScript',
      });

      repository.findByName.mockResolvedValue(null);

      repository.update.mockResolvedValue(null);

      await expect(
        service.updateSkill(
          'skill-1',
          {
            name: 'TypeScript',
          },
        ),
      ).rejects.toThrow(
        'Failed to update skill',
      );
    });
  });


  describe('deleteSkill', () => {
    it('should delete existing skill', async () => {
      repository.findById.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      repository.delete.mockResolvedValue(true);

      await service.deleteSkill('skill-1');

      expect(repository.delete)
        .toHaveBeenCalledWith('skill-1');
    });


    it('should throw when skill does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.deleteSkill('invalid-id'),
      ).rejects.toThrow('Skill not found');

      expect(repository.delete)
        .not.toHaveBeenCalled();
    });


    it('should throw when deletion fails', async () => {
      repository.findById.mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
      });

      repository.delete.mockResolvedValue(false);

      await expect(
        service.deleteSkill('skill-1'),
      ).rejects.toThrow(
        'Failed to delete skill',
      );
    });
  });
});