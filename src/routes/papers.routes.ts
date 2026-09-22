import { Router } from "express";
import {
  getPaperControllerAll,
  postPaperController,
  getPaperControllerSingle,
} from "../controllers/papers.controller";
import { requireAuth } from "../middleware/requireAuth";
import { verifyCsrfToken } from "../middleware/csrf";

const router = Router();

router.get("/mypapers", requireAuth, getPaperControllerAll);
router.post("/uploadpaper", requireAuth, verifyCsrfToken, postPaperController);
router.get("/:paper_id", requireAuth, getPaperControllerSingle);

export default router;
