import { pool } from "../config/db";

export async function getAllConcepts() {
  const result = await pool.query(
    "SELECT * FROM concepts_tbl ORDER BY concept_id",
  );
  return result.rows;
}
