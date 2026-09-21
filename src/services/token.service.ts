import jwt from "jsonwebtoken";

export function generateToken(user_id: string) {
  const accessToken = jwt.sign({ user_id }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ user_id }, process.env.JWT_REFRESH!, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
}
