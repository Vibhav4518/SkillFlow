import express, {
  type Request,
  type Response,
} from 'express';

import request from 'supertest';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';


/*
|--------------------------------------------------------------------------
| Mock controller functions
|--------------------------------------------------------------------------
|
| vi.hoisted() is used because vi.mock() is hoisted by Vitest.
| This allows us to access these mock functions safely inside vi.mock().
|
*/

const controllerMocks = vi.hoisted(() => ({
  getAllSkills: vi.fn(),
  getSkillById: vi.fn(),
  createSkill: vi.fn(),
  updateSkill: vi.fn(),
  deleteSkill: vi.fn(),
}));


/*
|--------------------------------------------------------------------------
| Mock SkillController
|--------------------------------------------------------------------------
|
| Route tests should test:
|
| Route
|   ↓
| Controller
|
| We do NOT want:
|
| Route
|   ↓
| Real Controller
|   ↓
| Service
|   ↓
| Repository
|   ↓
| Database
|
*/

vi.mock(
  '../controllers/skill.controller.js',
  () => ({
    SkillController: class {
      getAllSkills = controllerMocks.getAllSkills;

      getSkillById = controllerMocks.getSkillById;

      createSkill = controllerMocks.createSkill;

      updateSkill = controllerMocks.updateSkill;

      deleteSkill = controllerMocks.deleteSkill;
    },
  }),
);


/*
|--------------------------------------------------------------------------
| Import router AFTER controller mock declaration
|--------------------------------------------------------------------------
*/

import { skillRouter } from '../routes/skill.routes.js';


describe('SkillRoutes', () => {
  const app = express();

  app.use(express.json());

  app.use('/skills', skillRouter);


  beforeEach(() => {
    vi.clearAllMocks();


    /*
    |--------------------------------------------------------------------------
    | Default controller responses
    |--------------------------------------------------------------------------
    */

    controllerMocks.getAllSkills.mockImplementation(
      (_req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Skills fetched successfully',
          data: [],
        });
      },
    );


    controllerMocks.getSkillById.mockImplementation(
      (req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Skill fetched successfully',
          data: {
            id: req.params.skillId,
            name: 'TypeScript',
          },
        });
      },
    );


    controllerMocks.createSkill.mockImplementation(
      (req: Request, res: Response) => {
        res.status(201).json({
          success: true,
          message: 'Skill created successfully',
          data: {
            id: 'skill-1',
            name: req.body.name,
          },
        });
      },
    );


    controllerMocks.updateSkill.mockImplementation(
      (req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Skill updated successfully',
          data: {
            id: req.params.skillId,
            name: req.body.name,
          },
        });
      },
    );


    controllerMocks.deleteSkill.mockImplementation(
      (_req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Skill deleted successfully',
          data: null,
        });
      },
    );
  });


  /*
  |--------------------------------------------------------------------------
  | GET /skills
  |--------------------------------------------------------------------------
  */

  it('should register GET /skills route', async () => {
    const response = await request(app)
      .get('/skills');

    expect(response.status).toBe(200);

    expect(
      controllerMocks.getAllSkills,
    ).toHaveBeenCalledOnce();
  });


  /*
  |--------------------------------------------------------------------------
  | GET /skills/:skillId
  |--------------------------------------------------------------------------
  */

  it('should register GET /skills/:skillId route', async () => {
    const response = await request(app)
      .get('/skills/skill-123');

    expect(response.status).toBe(200);

    expect(
      controllerMocks.getSkillById,
    ).toHaveBeenCalledOnce();
  });


  it('should pass skillId parameter to controller', async () => {
    await request(app)
      .get('/skills/skill-123');

    expect(
      controllerMocks.getSkillById,
    ).toHaveBeenCalled();

    const req =
      controllerMocks.getSkillById.mock.calls[0][0];

    expect(req.params.skillId)
      .toBe('skill-123');
  });


  /*
  |--------------------------------------------------------------------------
  | POST /skills
  |--------------------------------------------------------------------------
  */

  it('should register POST /skills route', async () => {
    const response = await request(app)
      .post('/skills')
      .send({
        name: 'TypeScript',
      });

    expect(response.status).toBe(201);

    expect(
      controllerMocks.createSkill,
    ).toHaveBeenCalledOnce();
  });


  it('should pass request body to create controller', async () => {
    await request(app)
      .post('/skills')
      .send({
        name: 'TypeScript',
      });

    const req =
      controllerMocks.createSkill.mock.calls[0][0];

    expect(req.body).toEqual({
      name: 'TypeScript',
    });
  });


  /*
  |--------------------------------------------------------------------------
  | PATCH /skills/:skillId
  |--------------------------------------------------------------------------
  */

  it('should register PATCH /skills/:skillId route', async () => {
    const response = await request(app)
      .patch('/skills/skill-123')
      .send({
        name: 'Advanced TypeScript',
      });

    expect(response.status).toBe(200);

    expect(
      controllerMocks.updateSkill,
    ).toHaveBeenCalledOnce();
  });


  it('should pass skillId and body to update controller', async () => {
    await request(app)
      .patch('/skills/skill-123')
      .send({
        name: 'React',
      });

    const req =
      controllerMocks.updateSkill.mock.calls[0][0];

    expect(req.params.skillId)
      .toBe('skill-123');

    expect(req.body).toEqual({
      name: 'React',
    });
  });


  /*
  |--------------------------------------------------------------------------
  | DELETE /skills/:skillId
  |--------------------------------------------------------------------------
  */

  it('should register DELETE /skills/:skillId route', async () => {
    const response = await request(app)
      .delete('/skills/skill-123');

    expect(response.status).toBe(200);

    expect(
      controllerMocks.deleteSkill,
    ).toHaveBeenCalledOnce();
  });


  it('should pass skillId to delete controller', async () => {
    await request(app)
      .delete('/skills/skill-123');

    const req =
      controllerMocks.deleteSkill.mock.calls[0][0];

    expect(req.params.skillId)
      .toBe('skill-123');
  });


  /*
  |--------------------------------------------------------------------------
  | Unknown route
  |--------------------------------------------------------------------------
  */

  it('should return 404 for unknown skill route', async () => {
    const response = await request(app)
      .get('/skills/unknown/path');

    expect(response.status).toBe(404);
  });


  /*
  |--------------------------------------------------------------------------
  | Unsupported HTTP methods
  |--------------------------------------------------------------------------
  */

  it('should not allow PUT /skills/:skillId', async () => {
    const response = await request(app)
      .put('/skills/skill-123')
      .send({
        name: 'React',
      });

    expect(response.status).toBe(404);

    expect(
      controllerMocks.updateSkill,
    ).not.toHaveBeenCalled();
  });
});