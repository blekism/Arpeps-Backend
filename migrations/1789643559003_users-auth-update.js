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
  pgm.addColumn("users_tbl", {
    password_hash: {
      type: "text",
      notNull: true,
      default: "hehehe",
    },
    last_login_at: {
      type: "timestamptz",
      notNull: false,
    },
    failed_login_attempts: {
      type: "int",
      default: 0,
      notNull: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropColumns("users_tbl", [
    "password_hash",
    "last_login_at",
    "failed_login_attempts",
  ]);
};
