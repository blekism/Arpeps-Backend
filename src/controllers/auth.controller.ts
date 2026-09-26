import { Request, Response } from "express";
import { registerUser, verifyUser } from "../services/auth.service";
import { generateToken } from "../services/token.service";
import { pool } from "../config/db";
import jwt from "jsonwebtoken";

export const rijister = async (req: Request, res: Response) => {
  const { email, password, name } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password || !name) {
    return res.status(400).json({
      error: "email and password are required",
    });
  }

  try {
    const user = await registerUser(email, password, name);
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Registration failed uwu" });
  }
};

export const laggin = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({
      error: "email and password are required",
    });
  }

  try {
    const user = await verifyUser(email, password);
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const { accessToken, refreshToken } = generateToken(user.user_id);
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
      [user.user_id, refreshToken],
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await pool.query(
      "UPDATE refresh_tokens SET revoked = true WHERE token = $1",
      [refreshToken],
    );
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ status: "logged out" });
};

export const refresh = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    return res.status(401).json({
      error: "No refresh token",
    });
  }

  try {
    const payload = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH!) as {
      user_id: string;
    };

    const stored = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false",
      [oldRefreshToken],
    );

    if (stored.rows.length === 0) {
      return res.status(401).json({ error: "Refresh token invalid or reused" });
    }

    await pool.query(
      "UPDATE refresh_tokens SET revoked = true WHERE token = $1",
      [oldRefreshToken],
    );
    const { accessToken, refreshToken } = generateToken(payload.user_id);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
      [payload.user_id, refreshToken],
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ status: "refreshed" });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token", cuh: error });
  }
};
