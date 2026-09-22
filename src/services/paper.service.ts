import { pool } from "../config/db";

function buildMultiRowInsert(
  table: string,
  columns: string[],
  rows: any[][],
): { sql: string; values: any[] } {
  const values: any[] = [];
  const placeholders = rows.map((row, i) => {
    const offset = i * columns.length;
    values.push(...row);
    return `(${row.map((_, j) => `$${offset + j + 1}`).join(", ")})`;
  });

  return {
    sql: `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders.join(", ")}`,
    values,
  };
}

// INSERT INTO xtable (paper_id, reason, concept_id, cohesion_score) VALUES (134, xyzreaosn, 1, 0.98), (231, abcreason, 2, 0.76)

export async function getPaperServiceAll(user_id: string) {
  const res = await pool.query(
    // replace the first table with tbl1.* if going to use for FE for complete data
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
    WHERE tbl1.user_id = $1`,
    [user_id],
  );

  return res.rows;
}

export async function getPaperServiceSingle(user_id: string, paper_id: string) {
  const res = await pool.query(
    // replace the first table with tbl1.* if going to use for FE for complete data
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
    WHERE tbl1.user_id = $1 AND tbl1.paper_id = $2`,
    [user_id, paper_id],
  );

  return res.rows[0];
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

export async function postSaveAnalysisService(
  paper_id: string,
  extracted_concepts: {
    extracted_content: string;
    concept_id: number;
  }[],
  concept_relationships: {
    kind: number;
    strength: number;
    reason: string;
    from_concept: number;
    to_concept: number;
  }[],
  cohesion_analysis: {
    reason: string;
    concept_id: number;
    cohesion_score: string;
  }[],
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (extracted_concepts.length > 0) {
      const { sql, values } = buildMultiRowInsert(
        "extracted_concepts_tbl",
        ["paper_id", "extracted_content", "concept_id"],
        extracted_concepts.map((ec) => [
          paper_id,
          ec.extracted_content,
          ec.concept_id,
        ]),
      );

      await client.query(sql, values);
    }

    if (concept_relationships.length > 0) {
      const { sql, values } = buildMultiRowInsert(
        "concept_relationships_tbl",
        [
          "kind",
          "strength",
          "reason",
          "paper_id",
          "from_concept",
          "to_concept",
        ],
        concept_relationships.map((cr) => [
          paper_id,
          cr.kind,
          cr.strength,
          cr.reason,
          paper_id,
          cr.from_concept,
          cr.to_concept,
        ]),
      );

      await client.query(sql, values);
    }

    if (cohesion_analysis.length > 0) {
      const { sql, values } = buildMultiRowInsert(
        "cohesion_analysis_tbl",
        ["paper_id", "reason", "concept_id", "cohesion_score"],
        cohesion_analysis.map((ac) => [
          paper_id,
          ac.reason,
          ac.concept_id,
          ac.cohesion_score,
        ]),
      );

      await client.query(sql, values);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
