export interface paper {
  cohesion_analysis_tbl: Analysis[];
  concept_relationships_tbl: Connection[];
  content: string;
  created_at: string;
  extracted_concepts_tbl: Concepts[];
  overall_cohesion_score: string;
  paper_id: string;
  user_id: string;
}

export type Analysis = {
  cohesion_id: string;
  cohesion_score: string;
  concept_id: number;
  concepts_tbl: {
    concept_name: string;
  };
  created_at: string;
  paper_id: string;
  reason: string;
};

export type Connection = {
  created_at: string;
  crs_id: string;
  from: {
    concept_name: string;
  };
  kind: number;
  paper_id: string;
  reason: string;
  strength: number;
  to: {
    concept_name: string;
  };
  updated_at: string;
};

export type Concepts = {
  concept_id: string;
  concepts_tbl: {
    concept_name: string;
  };
  created_at: string;
  extracted_concept_id: string;
  extracted_content: string;
  paper_id: string;
};
