// src/scripts/test-jwt.ts
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const token = jwt.sign({ userId: "test-123" }, process.env.JWT_SECRET!, {
  expiresIn: "15m",
});
console.log("Token:", token);

const decoded = jwt.verify(token, process.env.JWT_SECRET!);
console.log("Decoded:", decoded);
