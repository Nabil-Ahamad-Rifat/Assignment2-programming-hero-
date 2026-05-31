import { pool } from "./database";

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("🔄 Initializing database schema...");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255)        NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        password   VARCHAR(255)        NOT NULL,
        role       VARCHAR(20)         NOT NULL DEFAULT 'contributor'
                     CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ users table created/verified");

    // Create issues table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(150) NOT NULL,
        description TEXT         NOT NULL,
        type        VARCHAR(20)  NOT NULL
                      CHECK (type IN ('bug', 'feature_request')),
        status      VARCHAR(20)  NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER      NOT NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ issues table created/verified");
    console.log("✅ Database initialization complete!");

  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};
