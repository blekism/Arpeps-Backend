import { pool } from "../config/db";
import bcrypt from "bcrypt";

export async function registerUser(email: string, password: string) {
  const passHash = await bcrypt.hash(password, 10);

  const res = await pool.query(
    "INSERT INTO users_tbl (email, password_hash) VALUES ($1, $2) RETURNING user_id, email",
    [email, passHash],
  );
  return res.rows[0];
}

export async function verifyUser(email: string, password: string) {
  const res = await pool.query("SELECT * FROM users_tbl WHERE email = $1", [
    email,
  ]);

  const user = res.rows[0];

  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);

  return valid ? user : null;
}
