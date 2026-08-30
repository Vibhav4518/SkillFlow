import { Router } from "express";
import { bookmarksController } from "./bookmarks.controller.js";
import { authGuard } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authGuard);

router.get("/", bookmarksController.getBookmarks);
router.post("/toggle", bookmarksController.toggleBookmark);
router.get("/check", bookmarksController.checkBookmark);
router.delete("/:id", bookmarksController.deleteBookmark);

export const bookmarksRouter = router;
