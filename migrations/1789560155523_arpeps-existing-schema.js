/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // TABLE 1
  pgm.createTable(
    "concepts_tbl",
    {
      concept_id: { type: "bigint", primaryKey: true },
      concept_name: { type: "varchar", default: "", notNull: true },
    },
    { ifNotExists: true },
  );
  // TABLE 2
  pgm.createTable(
    "users_tbl",
    {
      user_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      username: { type: "varchar", default: "", notNull: true },
      email: { type: "varchar", default: "", notNull: true },
      created_at: {
        type: "timestamp",
        default: pgm.func("now()"),
        notNull: true,
      },
    },
    { ifNotExists: true },
  );

  // TABLE 3
  pgm.createTable(
    "research_papers_tbl",
    {
      paper_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      user_id: {
        type: "uuid",
        notNull: true,
        references: "users_tbl",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      content: { type: "text", notNull: true },
      created_at: {
        type: "timestamp",
        default: pgm.func("now()"),
        notNull: true,
      },
      overall_cohesion_score: {
        type: "text",
        notNull: false,
      },
    },
    { ifNotExists: true },
  );

  // TABLE 4
  pgm.createTable(
    "extracted_concepts_tbl",
    {
      extracted_concept_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      paper_id: {
        type: "uuid",
        notNull: true,
        references: "research_papers_tbl",
        default: pgm.func("gen_random_uuid()"),
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      extracted_content: { type: "text", notNull: true },
      created_at: {
        type: "timestamp",
        default: pgm.func("now()"),
        notNull: true,
      },
      concept_id: {
        type: "bigint",
        notNull: true,
        references: "concepts_tbl",
      },
    },
    { ifNotExists: true },
  );

  // TABLE 5
  pgm.createTable(
    "cohesion_analysis_tbl",
    {
      cohesion_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      paper_id: {
        type: "uuid",
        notNull: true,
        references: "research_papers_tbl",
        default: pgm.func("gen_random_uuid()"),
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reason: { type: "text", notNull: true },
      created_at: {
        type: "timestamp",
        default: pgm.func("now()"),
        notNull: true,
      },
      concept_id: {
        type: "bigint",
        notNull: true,
        references: "concepts_tbl",
      },
      cohesion_score: {
        type: "text",
        notNull: true,
      },
    },
    { ifNotExists: true },
  );

  // TABLE 6
  pgm.createTable(
    "concept_relationships_tbl",
    {
      crs_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      kind: { type: "bigint", notNull: true },
      strength: { type: "bigint", notNull: true },
      reason: { type: "text", notNull: true },
      created_at: {
        type: "timestampz",
        default: pgm.func("now()"),
        notNull: true,
      },
      updated_at: {
        type: "timestamp",
        notNull: false,
      },
      paper_id: {
        type: "uuid",
        notNull: true,
        references: "research_papers_tbl",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      from_concept: {
        type: "bigint",
        notNull: true,
        references: "concepts_tbl",
      },
      to_concept: {
        type: "bigint",
        notNull: true,
        references: "concepts_tbl",
      },
    },
    { ifNotExists: true },
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
