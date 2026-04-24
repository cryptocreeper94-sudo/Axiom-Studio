/**
 * Axiom Studio — Add subscription columns to chat_users
 * Run once: npx tsx shared/migrate-tiers.ts
 */
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("[Migration] Adding subscription columns to chat_users...");

    // Add subscription columns (IF NOT EXISTS for idempotency)
    await client.query(`
      ALTER TABLE chat_users
        ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free',
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR,
        ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR,
        ADD COLUMN IF NOT EXISTS messages_this_month INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS month_reset_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS sms_phone VARCHAR,
        ADD COLUMN IF NOT EXISTS sms_opted_in BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS sms_opted_in_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS messages_used INTEGER DEFAULT 0;
    `);
    console.log("[Migration] ✓ subscription columns added");

    // Create usage tracking index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_users_stripe ON chat_users(stripe_customer_id);
    `);
    console.log("[Migration] ✓ Stripe index created");

    console.log("[Migration] Done!");
  } catch (err) {
    console.error("[Migration] Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
