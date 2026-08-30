import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import { SkillController } from '../controllers/skill.controller.js';

import type { ISkillService } from '../services/skill.service.js';


describe('SkillController', () => {
  let controller: SkillController;

  let service: {
    getAllSkills: ReturnType<typeof vi.fn>;
    getSkillById: ReturnType<typeof vi.fn>;
    createSkill: ReturnType<typeof vi.fn>;
    updateSkill: ReturnType<typeof vi.fn>;
    deleteSkill: ReturnType<typeof vi.fn>;
  };

  let response: Partial<Response>;

  let next: NextFunction;


  beforeEach(() => {
    service = {
      getAllSkills: vi.fn(),
      getSkillById: vi.fn(),
      createSkill: vi.fn(),
      updateSkill: vi.fn(),
      deleteSkill: vi.fn(),
    };

    controller = new SkillController(
      service as unknown as ISkillService,
    );

    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();
  });


  it('should create skill and return 201', async () => {
    service.createSkill.mockResolvedValue({
      id: 'skill-1',
      name: 'TypeScript',
    });

    const request = {
      body: {
        name: 'TypeScript',
      },
    } as Request;

    await controller.createSkill(
      request,
      response as Response,
      next,
    );

    expect(service.createSkill)
      .toHaveBeenCalledWith({
        name: 'TypeScript',
      });

    expect(response.status)
      .toHaveBeenCalledWith(201);

    expect(response.json)
      .toHaveBeenCalledWith({
        success: true,
        message: 'Skill created successfully',
        data: {
          id: 'skill-1',
          name: 'TypeScript',
        },
      });
  });


  it('should return all skills', async () => {
    service.getAllSkills.mockResolvedValue([
      {
        id: 'skill-1',
        name: 'TypeScript',
      },
    ]);

    await controller.getAllSkills(
      {} as Request,
      response as Response,
      next,
    );

    expect(response.status)
      .toHaveBeenCalledWith(200);
  });


  it('should fetch skill by id', async () => {
    service.getSkillById.mockResolvedValue({
      id: 'skill-1',
      name: 'TypeScript',
    });

    const request = {
      params: {
        skillId: 'skill-1',
      },
    } as unknown as Request<{
      skillId: string;
    }>;

    await controller.getSkillById(
      request,
      response as Response,
      next,
    );

    expect(service.getSkillById)
      .toHaveBeenCalledWith('skill-1');

    expect(response.status)
      .toHaveBeenCalledWith(200);
  });


  it('should update skill', async () => {
    service.updateSkill.mockResolvedValue({
      id: 'skill-1',
      name: 'React',
    });

    const request = {
      params: {
        skillId: 'skill-1',
      },

      body: {
        name: 'React',
      },
    } as unknown as Request<{
      skillId: string;
    }>;

    await controller.updateSkill(
      request,
      response as Response,
      next,
    );

    expect(service.updateSkill)
      .toHaveBeenCalledWith(
        'skill-1',
        {
          name: 'React',
        },
      );

    expect(response.status)
      .toHaveBeenCalledWith(200);
  });


  it('should delete skill', async () => {
    service.deleteSkill.mockResolvedValue(
      undefined,
    );

    const request = {
      params: {
        skillId: 'skill-1',
      },
    } as unknown as Request<{
      skillId: string;
    }>;

    await controller.deleteSkill(
      request,
      response as Response,
      next,
    );

    expect(service.deleteSkill)
      .toHaveBeenCalledWith('skill-1');

    expect(response.json)
      .toHaveBeenCalledWith({
        success: true,
        message: 'Skill deleted successfully',
        data: null,
      });
  });


  it('should pass service error to next', async () => {
    const error =
      new Error('Skill already exists');

    service.createSkill.mockRejectedValue(error);

    const request = {
      body: {
        name: 'TypeScript',
      },
    } as Request;

    await controller.createSkill(
      request,
      response as Response,
      next,
    );

    expect(next)
      .toHaveBeenCalledWith(error);
  });
});