import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      error: "No Token",
      code: "NO_TOKEN",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user_id = (payload as any).user_id;
    next();
  } catch (error) {
    // kapag expired ang token
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        error: "Token Expired",
        code: "TOKEN_EXPIRED",
      });
    }

    // babalik sa login
    return res.status(401).json({
      error: "Invalid Token",
      code: "INVALID_TOKEN",
    });
  }
}
