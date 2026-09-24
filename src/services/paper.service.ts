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
// 0 x 4 = 0 -> 0 + 0 + 1 = $1, 0 + 1 + 1 = $2, $3, $4
// 1 x 4 = 4 -> 4 + 0 + 1 = $5, 4 + 1 + 1 = $6, 4 + 2 + 1 = $7, 4 + 3 + 1 = $8

export async function getPaperServiceAll(user_id: string) {
  const res = await pool.query(
    `SELECT
      research_papers_tbl.*,
      COALESCE(children.items, '[]'::jsonb),
      COALESCE(children2.items, '[]'::jsonb),
      COALESCE(children3.items, '[]'::jsonb)
    FROM research_papers_tbl

    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(extracted_concepts_tbl)
            || jsonb_build_object(
                'concepts_tbl', jsonb_build_object('concept_name', concepts_tbl.concept_name)
            )
        ) AS items
        FROM extracted_concepts_tbl
        LEFT JOIN concepts_tbl
            ON concepts_tbl.concept_id = extracted_concepts_tbl.concept_id
        WHERE extracted_concepts_tbl.paper_id = research_papers_tbl.paper_id
    ) AS children ON true

     LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(cohesion_analysis_tbl)
            || jsonb_build_object(
                'concepts_tbl', jsonb_build_object('concept_name', concepts_tbl.concept_name)
            )
        ) AS items
        FROM cohesion_analysis_tbl
        LEFT JOIN concepts_tbl
            ON concepts_tbl.concept_id = cohesion_analysis_tbl.concept_id
        WHERE cohesion_analysis_tbl.paper_id = research_papers_tbl.paper_id
    ) AS children2 ON true

    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(concept_relationships_tbl) 
            || jsonb_build_object(
                'from_concept_ref', jsonb_build_object('concept_name', from.concept_name),
                'to_concept_ref', jsonb_build_object('concept_name', to.concept_name)
            )
        ) AS items
        FROM concept_relationships_tbl
        LEFT JOIN concepts_tbl from 
            ON from.concept_id = concept_relationships_tbl.from_concept
        LEFT JOIN concepts_tbl to
            ON to.concept_id = concept_relationships_tbl.to_concept
        WHERE concept_relationships_tbl.paper_id = research_papers_tbl.paper_id
    ) AS children3 ON true
    WHERE research_papers_tbl.user_id = $1`,
    [user_id],
  );

  return res.rows;
}

export async function getPaperServiceSingle(user_id: string, paper_id: string) {
  const res = await pool.query(
    // replace the first table with tbl1.* if going to use for FE for complete data
    `SELECT
      research_papers_tbl.*,
      COALESCE(children.items, '[]'::jsonb),
      COALESCE(children2.items, '[]'::jsonb),
      COALESCE(children3.items, '[]'::jsonb)
    FROM research_papers_tbl

    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(extracted_concepts_tbl)
            || jsonb_build_object(
                'concepts_tbl', jsonb_build_object('concept_name', concepts_tbl.concept_name)
            )
        ) AS items
        FROM extracted_concepts_tbl
        LEFT JOIN concepts_tbl
            ON concepts_tbl.concept_id = extracted_concepts_tbl.concept_id
        WHERE extracted_concepts_tbl.paper_id = research_papers_tbl.paper_id
    ) AS children ON true

     LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(cohesion_analysis_tbl)
            || jsonb_build_object(
                'concepts_tbl', jsonb_build_object('concept_name', concepts_tbl.concept_name)
            )
        ) AS items
        FROM cohesion_analysis_tbl
        LEFT JOIN concepts_tbl concepts_tbl
            ON concepts_tbl.concept_id = cohesion_analysis_tbl.concept_id
        WHERE cohesion_analysis_tbl.paper_id = research_papers_tbl.paper_id
    ) AS children2 ON true

    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(concept_relationships_tbl) 
            || jsonb_build_object(
                'from_concept_ref', jsonb_build_object('concept_name', from.concept_name),
                'to_concept_ref', jsonb_build_object('concept_name', to.concept_name)
            )
        ) AS items
        FROM concept_relationships_tbl
        LEFT JOIN concepts_tbl from 
            ON from.concept_id = concept_relationships_tbl.from_concept
        LEFT JOIN concepts_tbl to
            ON to.concept_id = concept_relationships_tbl.to_concept
        WHERE concept_relationships_tbl.paper_id = research_papers_tbl.paper_id
    ) AS children3 ON true
    WHERE research_papers_tbl.user_id = $1 AND research_papers_tbl.paper_id = $2`,
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
      console.log("extracted_concepts values:", values);

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
          cr.kind,
          cr.strength,
          cr.reason,
          paper_id,
          cr.from_concept,
          cr.to_concept,
        ]),
      );
      console.log("extracted_concepts values:", values);
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
      console.log("extracted_concepts values:", values);

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

export async function getMarkdownPaperSingle(
  user_id: string,
  paper_id: string,
) {
  const res = await pool.query(
    `SELECT paper_id, content FROM research_papers_tbl WHERE user_id = $1 AND paper_id = $2`,
    [user_id, paper_id],
  );

  return res.rows[0];
}

export async function getPaperMapService(user_id: string, paper_id: string) {
  const res = await pool.query(
    `SELECT
      research_papers_tbl.paper_id,
      research_papers_tbl.user_id,
      COALESCE(children.items, '[]'::jsonb),
      COALESCE(children3.items, '[]'::jsonb)
    FROM research_papers_tbl

    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(extracted_concepts_tbl)
            || jsonb_build_object(
                'concepts_tbl', jsonb_build_object('concept_name', concepts_tbl.concept_name)
            )
        ) AS items
        FROM extracted_concepts_tbl
        LEFT JOIN concepts_tbl
            ON concepts_tbl.concept_id = extracted_concepts_tbl.concept_id
        WHERE extracted_concepts_tbl.paper_id = research_papers_tbl.paper_id
    ) AS children ON true

    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            to_jsonb(concept_relationships_tbl) 
            || jsonb_build_object(
                'from_concept_ref', jsonb_build_object('concept_name', from.concept_name),
                'to_concept_ref', jsonb_build_object('concept_name', to.concept_name)
            )
        ) AS items
        FROM concept_relationships_tbl
        LEFT JOIN concepts_tbl from 
            ON from.concept_id = concept_relationships_tbl.from_concept
        LEFT JOIN concepts_tbl to
            ON to.concept_id = concept_relationships_tbl.to_concept
        WHERE concept_relationships_tbl.paper_id = research_papers_tbl.paper_id
    ) AS children3 ON true

    WHERE research_papers_tbl.user_id = $1 AND research_papers_tbl.paper_id = $2`,
    [user_id, paper_id],
  );

  return res.rows[0];
}

export async function deletePaperSingle(user_id: string, paper_id: string) {
  await pool.query(
    `DELETE FROM research_papers_tbl WHERE user_id = $1 AND paper_id = $2`,
    [user_id, paper_id],
  );
}
