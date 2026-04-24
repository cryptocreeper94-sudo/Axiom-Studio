/**
 * Axiom Ecosystem — Owner + Kemper Provisioning
 * 
 * - Creates owner account (cryptocreeper94@gmail.com) with unlimited access
 * - Grants Mathew Kemper $25 worth of credits (500 credits)
 * - Sets owner role for bypass on all credit/tier gates
 *
 * Run: npx tsx shared/migrate-owner.ts
 *
 * DarkWave Studios LLC — Copyright 2026
 */

import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL || "";
const needsSsl = dbUrl.includes("neon") || dbUrl.includes("render") || dbUrl.includes("amazonaws");

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

const OWNER_EMAIL = "cryptocreeper94@gmail.com";
const OWNER_USERNAME = "rjandrews";
const OWNER_DISPLAY = "RJ Andrews";
const OWNER_PASSWORD = "94JAj@94";
const OWNER_PIN = "0424";

const KEMPER_EMAIL = "pcdirect97@gmail.com";
const KEMPER_CREDITS = 500; // ~$25 at builder rate ($0.04-0.05/credit)

async function migrate() {
  console.log("[Owner] Starting owner provisioning...\n");

  // ── 1. Add owner to whitelist ──
  console.log("[1/6] Updating whitelist...");
  await pool.query(`
    INSERT INTO ecosystem_whitelist (email, display_name, access_level, apps, notes, granted_by)
    VALUES ($1, $2, 'owner', 
      ARRAY['axiom-studio','axiom42','trustgen','trustvault','lumeline','darkwavestudios','all'],
      'Director / Owner — skeleton key, unlimited access',
      'system'
    ) ON CONFLICT (email) DO UPDATE SET
      access_level = 'owner',
      apps = ARRAY['axiom-studio','axiom42','trustgen','trustvault','lumeline','darkwavestudios','all'],
      active = true,
      updated_at = NOW();
  `, [OWNER_EMAIL, OWNER_DISPLAY]);

  // Also keep the rj@ entry as owner
  await pool.query(`
    UPDATE ecosystem_whitelist SET access_level = 'owner', updated_at = NOW()
    WHERE email = 'rj@darkwavestudios.io';
  `);

  console.log("   Whitelist updated (owner + rj@).\n");

  // ── 2. Create or update owner in chat_users (Axiom Studio auth) ──
  console.log("[2/6] Provisioning owner account in chat_users...");
  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);

  const existing = await pool.query(
    `SELECT id FROM chat_users WHERE email = $1`, [OWNER_EMAIL]
  );

  let ownerId: string;
  if (existing.rows.length > 0) {
    ownerId = existing.rows[0].id;
    await pool.query(`
      UPDATE chat_users SET 
        password_hash = $1,
        role = 'owner',
        display_name = $2,
        ecosystem_pin_hash = $3
      WHERE email = $4
    `, [passwordHash, OWNER_DISPLAY, OWNER_PIN, OWNER_EMAIL]);
    console.log(`   Updated existing account (id: ${ownerId}).\n`);
  } else {
    const result = await pool.query(`
      INSERT INTO chat_users (username, email, password_hash, display_name, avatar_color, role, ecosystem_pin_hash)
      VALUES ($1, $2, $3, $4, '#06b6d4', 'owner', $5)
      RETURNING id
    `, [OWNER_USERNAME, OWNER_EMAIL, passwordHash, OWNER_DISPLAY, OWNER_PIN]);
    ownerId = result.rows[0].id;
    console.log(`   Created owner account (id: ${ownerId}).\n`);
  }

  // ── 3. Set unlimited credits for owner ──
  console.log("[3/6] Setting unlimited credits for owner...");
  const existingBalance = await pool.query(
    `SELECT id FROM ai_credit_balances WHERE user_id = $1`, [ownerId]
  );

  if (existingBalance.rows.length > 0) {
    await pool.query(`
      UPDATE ai_credit_balances SET credits = 999999, total_purchased = 999999, updated_at = NOW()
      WHERE user_id = $1
    `, [ownerId]);
  } else {
    await pool.query(`
      INSERT INTO ai_credit_balances (user_id, credits, total_purchased, total_used)
      VALUES ($1, 999999, 999999, 0)
    `, [ownerId]);
  }
  console.log("   Owner credits: 999,999 (unlimited).\n");

  // ── 4. Grant Kemper $25 of credits (500) ──
  console.log("[4/6] Granting Mathew Kemper $25 of credits...");
  const kemperUser = await pool.query(
    `SELECT id FROM chat_users WHERE email = $1`, [KEMPER_EMAIL]
  );

  if (kemperUser.rows.length > 0) {
    const kemperId = kemperUser.rows[0].id;
    const kemperBal = await pool.query(
      `SELECT id FROM ai_credit_balances WHERE user_id = $1`, [kemperId]
    );
    if (kemperBal.rows.length > 0) {
      await pool.query(`
        UPDATE ai_credit_balances SET credits = $1, total_purchased = $1, updated_at = NOW()
        WHERE user_id = $2
      `, [KEMPER_CREDITS, kemperId]);
    } else {
      await pool.query(`
        INSERT INTO ai_credit_balances (user_id, credits, total_purchased, total_used)
        VALUES ($1, $2, $2, 0)
      `, [kemperId, KEMPER_CREDITS]);
    }
    console.log(`   Kemper credits: ${KEMPER_CREDITS} ($25 worth).\n`);
  } else {
    console.log(`   Kemper has not signed up yet — credits will be set to ${KEMPER_CREDITS} on signup (via whitelist).\n`);
    // Update the whitelist to mark his credit grant
    await pool.query(`
      UPDATE ecosystem_whitelist SET notes = $1, updated_at = NOW() WHERE email = $2
    `, [`First external user — pre-granted ${KEMPER_CREDITS} credits ($25)`, KEMPER_EMAIL]);
  }

  // ── 5. Create owner tenant in DDA (axiom42) — may be on separate DB ──
  console.log("[5/6] Provisioning owner tenant in axiom_tenants...");
  try {
    const { createHash, randomBytes } = await import("crypto");
    const salt = randomBytes(16).toString("hex");
    const ddaPasswordHash = createHash("sha256").update(salt + OWNER_PASSWORD).digest("hex");
    const ddaStoredHash = `${salt}:${ddaPasswordHash}`;

    // Generate API key
    const apiSecret = randomBytes(24).toString("hex");
    const apiKey = `ax_live_${apiSecret}`;
    const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");
    const apiKeyPrefix = apiKey.slice(0, 16) + "…";

    const existingTenant = await pool.query(
      `SELECT id FROM axiom_tenants WHERE email = $1`, [OWNER_EMAIL]
    );

    if (existingTenant.rows.length > 0) {
      await pool.query(`
        UPDATE axiom_tenants SET 
          password_hash = $1, tier = 'ENTERPRISE', active = true, updated_at = NOW()
        WHERE email = $2
      `, [ddaStoredHash, OWNER_EMAIL]);
      console.log("   Updated existing DDA tenant to ENTERPRISE.\n");
    } else {
      await pool.query(`
        INSERT INTO axiom_tenants (email, name, password_hash, tier, api_key_hash, api_key_prefix)
        VALUES ($1, $2, $3, 'ENTERPRISE', $4, $5)
      `, [OWNER_EMAIL, OWNER_DISPLAY, ddaStoredHash, apiKeyHash, apiKeyPrefix]);
      console.log(`   Created DDA tenant (ENTERPRISE tier).\n`);
      console.log(`   API Key (save this): ${apiKey}\n`);
    }
  } catch (err: any) {
    console.log(`   Skipped — axiom_tenants not on this DB (DDA uses separate connection).\n`);
    console.log(`   Owner tenant will auto-provision when signing up on axiom42.com with whitelisted email.\n`);
  }

  // ── 6. Show final state ──
  console.log("[6/6] Final whitelist state:");
  const { rows } = await pool.query(
    `SELECT email, display_name, access_level, apps, active FROM ecosystem_whitelist ORDER BY id`
  );
  console.table(rows);

  console.log("\nOwner credentials summary:");
  console.log("  Email:    cryptocreeper94@gmail.com");
  console.log("  Username: rjandrews");
  console.log("  PIN:      0424");
  console.log("  Role:     owner (bypasses all gates)");
  console.log("  Credits:  999,999 (unlimited)");
  console.log("  DDA Tier: ENTERPRISE (unlimited)");

  await pool.end();
  console.log("\n[Owner] Provisioning complete.");
}

migrate().catch((err) => {
  console.error("[Owner] Failed:", err);
  process.exit(1);
});
