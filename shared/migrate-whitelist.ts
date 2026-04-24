/**
 * Axiom Ecosystem — Whitelist Migration
 * Creates the shared ecosystem_whitelist table and seeds initial entries.
 *
 * Run: npx tsx shared/migrate-whitelist.ts
 *
 * DarkWave Studios LLC — Copyright 2026
 */

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log("[Migration] Creating ecosystem_whitelist table...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ecosystem_whitelist (
      id            SERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      display_name  TEXT NOT NULL DEFAULT '',
      access_level  TEXT NOT NULL DEFAULT 'full',
      apps          TEXT[] NOT NULL DEFAULT '{}',
      notes         TEXT,
      granted_by    TEXT NOT NULL DEFAULT 'system',
      active        BOOLEAN DEFAULT true,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_whitelist_email ON ecosystem_whitelist(email);
    CREATE INDEX IF NOT EXISTS idx_whitelist_active ON ecosystem_whitelist(active);
  `);

  console.log("[Migration] Table created.");

  // ── Seed: Director (always present) ──
  await pool.query(`
    INSERT INTO ecosystem_whitelist (email, display_name, access_level, apps, notes, granted_by)
    VALUES (
      'rj@darkwavestudios.io',
      'RJ Andrews',
      'full',
      ARRAY['axiom-studio','axiom42','trustgen','trustvault','lumeline','darkwavestudios','all'],
      'Director — full ecosystem access',
      'system'
    ) ON CONFLICT (email) DO UPDATE SET
      access_level = 'full',
      apps = ARRAY['axiom-studio','axiom42','trustgen','trustvault','lumeline','darkwavestudios','all'],
      active = true,
      updated_at = NOW();
  `);

  // ── Seed: Mathew Kemper ──
  // He registered via LumeLine — we whitelist by email.
  // If his email is different, update this entry in production.
  await pool.query(`
    INSERT INTO ecosystem_whitelist (email, display_name, access_level, apps, notes, granted_by)
    VALUES (
      'mathew.kemper@gmail.com',
      'Mathew Kemper',
      'full',
      ARRAY['axiom-studio','axiom42','trustgen','trustvault','lumeline'],
      'First external whitelisted user — existing LumeLine registration',
      'rj'
    ) ON CONFLICT (email) DO UPDATE SET
      access_level = 'full',
      apps = ARRAY['axiom-studio','axiom42','trustgen','trustvault','lumeline'],
      active = true,
      updated_at = NOW();
  `);

  console.log("[Migration] Whitelist seeded (Director + Mathew Kemper).");

  // ── Show current whitelist ──
  const { rows } = await pool.query(
    `SELECT email, display_name, access_level, apps, active FROM ecosystem_whitelist ORDER BY id`
  );
  console.table(rows);

  await pool.end();
  console.log("[Migration] Done.");
}

migrate().catch((err) => {
  console.error("[Migration] Failed:", err);
  process.exit(1);
});
