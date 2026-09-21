import { Router } from "express";
import {
  getPaperController,
  postPaperController,
} from "../controllers/papers.controller";
import { requireAuth } from "../middleware/requireAuth";
import { verifyCsrfToken } from "../middleware/csrf";

const router = Router();

router.get("/mypapers", requireAuth, getPaperController);
router.post("/uploadpaper", requireAuth, verifyCsrfToken, postPaperController);

export default router;
