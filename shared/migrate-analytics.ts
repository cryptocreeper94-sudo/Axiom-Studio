/**
 * Axiom Studio — Analytics tables migration
 * Run once: npx tsx shared/migrate-analytics.ts
 */
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("[Migration] Creating analytics tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS axiom_page_views (
        id SERIAL PRIMARY KEY,
        path VARCHAR(512) NOT NULL,
        referrer VARCHAR(1024),
        user_agent TEXT,
        session_id VARCHAR(64),
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("[Migration] axiom_page_views created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS axiom_events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        category VARCHAR(64) DEFAULT 'general',
        properties JSONB DEFAULT '{}',
        session_id VARCHAR(64),
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("[Migration] axiom_events created");

    // Indexes for performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_axiom_pv_created ON axiom_page_views(created_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_axiom_pv_session ON axiom_page_views(session_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_axiom_ev_created ON axiom_events(created_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_axiom_ev_name ON axiom_events(name);`);
    console.log("[Migration] Indexes created");

    console.log("[Migration] Done!");
  } catch (err) {
    console.error("[Migration] Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
