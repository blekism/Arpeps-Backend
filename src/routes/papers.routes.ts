import { Router } from "express";
import {
  getPaperControllerAll,
  postPaperController,
  getPaperControllerSingle,
  postSaveAnalysisController,
  getMarkdownControllerSingle,
  getMapControllerSingle,
  deletePaperControllerSingle,
} from "../controllers/papers.controller";
import { requireAuth } from "../middleware/requireAuth";
import { verifyCsrfToken } from "../middleware/csrf";

const router = Router();

router.get("/mypapers", requireAuth, getPaperControllerAll);
router.post("/uploadpaper", requireAuth, verifyCsrfToken, postPaperController);
router.get("/apaper/:paper_id", requireAuth, getPaperControllerSingle);
router.get("/acontent/:paper_id", requireAuth, getMarkdownControllerSingle);
router.get("/amap/:paper_id", requireAuth, getMapControllerSingle);
router.post(
  "/uploadanalysis",
  requireAuth,
  verifyCsrfToken,
  postSaveAnalysisController,
);
router.delete(
  "/deletepaper/:paper_id",
  requireAuth,
  deletePaperControllerSingle,
);

export default router;
