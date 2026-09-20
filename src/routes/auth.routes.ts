import { Router } from "express";
import {
  rijister,
  laggin,
  logout,
  refresh,
} from "../controllers/auth.controller";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes,
  max: 5, // 5 attempts per window per ip
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true, //sends rate limit headers so client knows ball
  legacyHeaders: true,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes,
  max: 20, // 5 attempts per window per ip
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true, //sends rate limit headers so client knows ball
  legacyHeaders: true,
});

const router = Router();

router.post("/register", authLimiter, rijister);
router.post("/login", authLimiter, laggin);
router.post("/logout", logout);
router.post("/refresh", refreshLimiter, refresh);

export default router;
