import { pool } from "../config/db";

export async function getPaperService(user_id: string) {
  const res = await pool.query(
    `SELECT
      tbl1.paper_id,
      tbl1.user_id,
      tbl1.created_at,
      tbl1.overall_cohesion_score,
      COALESCE(children.items, '[]'::jsonb) as tbl2,
      COALESCE(children2.items, '[]'::jsonb) as tbl3,
      COALESCE(children3.items, '[]'::jsonb) as tbl4
    FROM research_papers_tbl as tbl1
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(tbl2)
            || jsonb_build_object(
                'tbl5', jsonb_build_object('concept_name', tbl5.concept_name)
            )
        ) AS items
        FROM extracted_concepts_tbl tbl2
        LEFT JOIN concepts_tbl tbl5
            ON tbl5.concept_id = tbl2.concept_id
        WHERE tbl2.paper_id = tbl1.paper_id
    ) AS children ON true
     LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(tbl3)
            || jsonb_build_object(
                'tbl5', jsonb_build_object('concept_name', tbl5.concept_name)
            )
        ) AS items
        FROM cohesion_analysis_tbl tbl3
        LEFT JOIN concepts_tbl tbl5
            ON tbl5.concept_id = tbl3.concept_id
        WHERE tbl3.paper_id = tbl1.paper_id
    ) AS children2 ON true

    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(tbl4) 
            || jsonb_build_object(
                'from_concept_ref', jsonb_build_object('concept_name', tbl5_from.concept_name),
                'to_concept_ref', jsonb_build_object('concept_name', tbl5_to.concept_name)
            )
        ) AS items
        FROM concept_relationships_tbl tbl4
        LEFT JOIN concepts_tbl tbl5_from 
            ON tbl5_from.concept_id = tbl4.from_concept
        LEFT JOIN concepts_tbl tbl5_to
            ON tbl5_to.concept_id = tbl4.to_concept
        WHERE tbl4.paper_id = tbl1.paper_id
    ) AS children3 ON true
    WHERE user_id = $1`,
    [user_id],
  );

  return res.rows;
}

export async function postPaperService(user_id: string, content: string) {
  const res = await pool.query(
    `INSERT INTO 
            research_papers_tbl (user_id, content, overall_cohesion_score) 
        VALUES ($1, $2, $3)`,
    [user_id, content, "0%"],
  );

  return res.rows[0];
}
