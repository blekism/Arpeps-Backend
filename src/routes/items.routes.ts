import { Router } from "express";
import { getConcepts, createItem } from "../controllers/items.controller";

const router = Router();

router.get("/", getConcepts);
router.post("/", createItem);

export default router;
