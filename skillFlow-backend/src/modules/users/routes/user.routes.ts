import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { updateUserSchema, userIdParamSchema } from "../schemas/user.schema.js";
import { validate } from "../../../middlewares/validation.middleware.js";

const router = Router();

router.get("/", userController.getAllUsers.bind(userController));
router.get("/:id", validate(userIdParamSchema), userController.getUserById.bind(userController));
router.patch("/:id", validate(userIdParamSchema), validate(updateUserSchema), userController.updateUser.bind(userController));
router.delete("/:id", validate(userIdParamSchema), userController.deleteUser.bind(userController));

export const userRoutes = router;