import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createSkillSchema,
  updateSkillSchema,
} from '../schemas/skill.schema.js';


describe('SkillSchema', () => {
  describe('createSkillSchema', () => {
    it('should accept valid skill name', () => {
      const result =
        createSkillSchema.safeParse({
          body: {
            name: 'TypeScript',
          },
        });

      expect(result.success).toBe(true);
    });


    it('should reject empty skill name', () => {
      const result =
        createSkillSchema.safeParse({
          body: {
            name: '',
          },
        });

      expect(result.success).toBe(false);
    });


    it('should reject whitespace-only name', () => {
      const result =
        createSkillSchema.safeParse({
          body: {
            name: '     ',
          },
        });

      expect(result.success).toBe(false);
    });


    it('should reject missing name', () => {
      const result =
        createSkillSchema.safeParse({
          body: {},
        });

      expect(result.success).toBe(false);
    });


    it('should reject name longer than 100 characters', () => {
      const result =
        createSkillSchema.safeParse({
          body: {
            name: 'a'.repeat(101),
          },
        });

      expect(result.success).toBe(false);
    });
  });


  describe('updateSkillSchema', () => {
    it('should accept valid skill name', () => {
      const result =
        updateSkillSchema.safeParse({
          body: {
            name: 'React',
          },
        });

      expect(result.success).toBe(true);
    });


    it('should allow missing name', () => {
      const result =
        updateSkillSchema.safeParse({
          body: {},
        });

      expect(result.success).toBe(true);
    });


    it('should reject empty provided name', () => {
      const result =
        updateSkillSchema.safeParse({
          body: {
            name: '',
          },
        });

      expect(result.success).toBe(false);
    });
  });
});