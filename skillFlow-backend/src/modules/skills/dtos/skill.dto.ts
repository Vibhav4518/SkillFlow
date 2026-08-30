export interface CreateSkillDTO {
  name: string;
}

export interface UpdateSkillDTO {
  name?: string;
}

export interface SkillResponseDTO {
  id: string;
  name: string;
}