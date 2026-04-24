/**
 * Axiom Studio — Analytics Routes
 * Page view tracking, event tracking, and admin stats API.
 * Mirrors the DWTL analytics pattern.
 * DarkWave Studios LLC — Copyright 2026
 */
import { Router, Request, Response } from "express";
import { Pool } from "pg";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /api/analytics/pageview — Track a page view
 */
router.post("/pageview", async (req: Request, res: Response) => {
  try {
    const { path, referrer, userAgent, sessionId, userId } = req.body;
    if (!path) return res.status(400).json({ error: "Path required" });

    await pool.query(
      `INSERT INTO axiom_page_views (path, referrer, user_agent, session_id, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [path, referrer || null, userAgent || null, sessionId || null, userId || null]
    );

    res.status(201).json({ success: true });
  } catch (err: any) {
    console.error("[Analytics] Pageview error:", err.message);
    res.status(500).json({ error: "Failed to track pageview" });
  }
});

/**
 * POST /api/analytics/event — Track a custom event
 */
router.post("/event", async (req: Request, res: Response) => {
  try {
    const { name, category, properties, sessionId, userId } = req.body;
    if (!name) return res.status(400).json({ error: "Event name required" });

    await pool.query(
      `INSERT INTO axiom_events (name, category, properties, session_id, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [name, category || "general", JSON.stringify(properties || {}), sessionId || null, userId || null]
    );

    res.status(201).json({ success: true });
  } catch (err: any) {
    console.error("[Analytics] Event error:", err.message);
    res.status(500).json({ error: "Failed to track event" });
  }
});

/**
 * GET /api/analytics/stats — Admin summary stats
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    // Page views summary
    const pvResult = await pool.query(
      `SELECT COUNT(*) as total_views,
              COUNT(DISTINCT session_id) as unique_sessions,
              COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users
       FROM axiom_page_views WHERE created_at >= $1`,
      [since]
    );

    // Top pages
    const topPagesResult = await pool.query(
      `SELECT path, COUNT(*) as views
       FROM axiom_page_views WHERE created_at >= $1
       GROUP BY path ORDER BY views DESC LIMIT 10`,
      [since]
    );

    // Daily page views (for chart)
    const dailyResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as views
       FROM axiom_page_views WHERE created_at >= $1
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [since]
    );

    // Event summary
    const eventResult = await pool.query(
      `SELECT name, category, COUNT(*) as count
       FROM axiom_events WHERE created_at >= $1
       GROUP BY name, category ORDER BY count DESC LIMIT 20`,
      [since]
    );

    // Total events
    const eventCountResult = await pool.query(
      `SELECT COUNT(*) as total FROM axiom_events WHERE created_at >= $1`,
      [since]
    );

    // Message stats
    const messageResult = await pool.query(
      `SELECT COUNT(*) as total_messages,
              COUNT(DISTINCT user_id) as active_users,
              SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_messages,
              SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END) as assistant_messages
       FROM messages WHERE created_at >= $1`,
      [since]
    ).catch(() => ({ rows: [{ total_messages: 0, active_users: 0, user_messages: 0, assistant_messages: 0 }] }));

    // Active conversations
    const convoResult = await pool.query(
      `SELECT COUNT(*) as total FROM conversations WHERE created_at >= $1`,
      [since]
    ).catch(() => ({ rows: [{ total: 0 }] }));

    // Tier breakdown
    const tierResult = await pool.query(
      `SELECT COALESCE(subscription_tier, 'free') as tier, COUNT(*) as count
       FROM chat_users GROUP BY subscription_tier ORDER BY count DESC`
    ).catch(() => ({ rows: [] }));

    const stats = pvResult.rows[0];

    res.json({
      success: true,
      period: `${days}d`,
      pageViews: {
        total: parseInt(stats.total_views) || 0,
        uniqueSessions: parseInt(stats.unique_sessions) || 0,
        uniqueUsers: parseInt(stats.unique_users) || 0,
        topPages: topPagesResult.rows.map((r) => ({
          path: r.path,
          views: parseInt(r.views),
        })),
        daily: dailyResult.rows.map((r) => ({
          date: r.date,
          views: parseInt(r.views),
        })),
      },
      events: {
        total: parseInt(eventCountResult.rows[0]?.total) || 0,
        breakdown: eventResult.rows.map((r) => ({
          name: r.name,
          category: r.category,
          count: parseInt(r.count),
        })),
      },
      messages: {
        total: parseInt(messageResult.rows[0]?.total_messages) || 0,
        activeUsers: parseInt(messageResult.rows[0]?.active_users) || 0,
        userMessages: parseInt(messageResult.rows[0]?.user_messages) || 0,
        assistantMessages: parseInt(messageResult.rows[0]?.assistant_messages) || 0,
      },
      conversations: {
        total: parseInt(convoResult.rows[0]?.total) || 0,
      },
      tiers: tierResult.rows.map((r) => ({
        tier: r.tier,
        count: parseInt(r.count),
      })),
    });
  } catch (err: any) {
    console.error("[Analytics] Stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/**
 * GET /api/analytics/realtime — Last 5 minutes of activity
 */
router.get("/realtime", async (_req: Request, res: Response) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();

    const activeResult = await pool.query(
      `SELECT COUNT(DISTINCT session_id) as active_sessions
       FROM axiom_page_views WHERE created_at >= $1`,
      [fiveMinAgo]
    );

    const recentPages = await pool.query(
      `SELECT path, created_at FROM axiom_page_views
       WHERE created_at >= $1 ORDER BY created_at DESC LIMIT 10`,
      [fiveMinAgo]
    );

    res.json({
      success: true,
      activeSessions: parseInt(activeResult.rows[0]?.active_sessions) || 0,
      recentPages: recentPages.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch realtime data" });
  }
});

export default router;
