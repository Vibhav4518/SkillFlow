import { Router } from "express";
import { SkillController } from "../controllers/skill.controller.js";

const router = Router();

const skillController = new SkillController();

router.get("/", skillController.getAllSkills);
router.get("/:skillId", skillController.getSkillById);
router.post("/", skillController.createSkill);
router.patch("/:skillId", skillController.updateSkill);
router.delete("/:skillId", skillController.deleteSkill);

export const skillRouter = router;
