/**
 * Axiom Studio — Stripe Subscription Routes
 * Handles checkout, webhooks, and usage tracking.
 * 
 * DarkWave Studios LLC — Copyright 2026
 */

import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { eq, sql, and, gte } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { chatUsers } from "../shared/schema.js";
import { TIERS, STRIPE_PRICE_IDS, getTierForUser } from "./tiers.js";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2025-04-30.basil" as any })
  : null;

function extractUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET || "") as any;
    return decoded.userId || decoded.id || null;
  } catch {
    return null;
  }
}

export function registerStripeRoutes(app: Express): void {
  // ── Get subscription tiers ─────────────────────────────────────────
  app.get("/api/agent/tiers", (_req: Request, res: Response) => {
    const tiers = Object.values(TIERS).map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      messagesPerMonth: t.messagesPerMonth,
      forceOpus: t.forceOpus,
      overflowRate: t.overflowRate,
      features: t.features,
    }));
    res.json(tiers);
  });

  // ── Get user's current subscription ────────────────────────────────
  app.get("/api/agent/subscription", async (req: Request, res: Response) => {
    const userId = extractUserId(req);
    if (!userId) { res.status(401).json({ error: "Auth required" }); return; }

    // For now, read tier from user record (we'll add a subscription table later)
    const [user] = await db.select().from(chatUsers).where(eq(chatUsers.id, userId)).limit(1);
    const tier = getTierForUser((user as any)?.subscriptionTier || "free");

    // Get current month's usage from agent_messages
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count messages this month (raw SQL since we don't have a typed usage table yet)
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM agent_messages am
      JOIN agent_conversations ac ON am.conversation_id = ac.id
      WHERE ac.user_id = ${userId}
      AND am.role = 'assistant'
      AND am.created_at >= ${monthStart}
    `);

    const messagesUsed = parseInt(String((result as any).rows?.[0]?.count || 0));

    res.json({
      tier: tier.id,
      tierName: tier.name,
      messagesPerMonth: tier.messagesPerMonth,
      messagesUsed,
      messagesRemaining: Math.max(0, tier.messagesPerMonth - messagesUsed),
      forceOpus: tier.forceOpus,
      overflowRate: tier.overflowRate,
    });
  });

  // ── Create Stripe checkout session ─────────────────────────────────
  app.post("/api/agent/subscribe", async (req: Request, res: Response) => {
    const userId = extractUserId(req);
    if (!userId) { res.status(401).json({ error: "Auth required" }); return; }

    const { tierId } = req.body;
    const priceId = STRIPE_PRICE_IDS[tierId];

    if (!stripe || !priceId) {
      res.status(400).json({ error: "Invalid tier or Stripe not configured" });
      return;
    }

    const [user] = await db.select().from(chatUsers).where(eq(chatUsers.id, userId)).limit(1);

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user?.email || undefined,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.APP_URL || "https://axiomstudio.dev"}/billing?success=true`,
        cancel_url: `${process.env.APP_URL || "https://axiomstudio.dev"}/billing?canceled=true`,
        metadata: { userId, tierId },
      });

      res.json({ url: session.url });
    } catch (err: any) {
      console.error("[Stripe] Checkout error:", err.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // ── Stripe webhook ─────────────────────────────────────────────────
  app.post("/api/agent/webhook/stripe", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    if (!stripe) { res.status(500).send("Stripe not configured"); return; }

    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody || req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      console.error("[Stripe] Webhook signature failed:", err.message);
      res.status(400).send("Webhook signature failed");
      return;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tierId = session.metadata?.tierId;

        if (userId && tierId) {
          // Update user's tier
          await db.execute(sql`
            UPDATE chat_users SET subscription_tier = ${tierId},
            stripe_customer_id = ${session.customer as string},
            stripe_subscription_id = ${session.subscription as string}
            WHERE id = ${userId}
          `);
          console.log(`[Stripe] User ${userId} subscribed to ${tierId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // Downgrade to free
        await db.execute(sql`
          UPDATE chat_users SET subscription_tier = 'free'
          WHERE stripe_subscription_id = ${sub.id}
        `);
        console.log(`[Stripe] Subscription ${sub.id} canceled → free tier`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.status === "past_due" || sub.status === "unpaid") {
          await db.execute(sql`
            UPDATE chat_users SET subscription_tier = 'free'
            WHERE stripe_subscription_id = ${sub.id}
          `);
          console.log(`[Stripe] Subscription ${sub.id} payment failed → free tier`);
        }
        break;
      }
    }

    res.json({ received: true });
  });

  // ── Cancel subscription ────────────────────────────────────────────
  app.post("/api/agent/subscription/cancel", async (req: Request, res: Response) => {
    const userId = extractUserId(req);
    if (!userId) { res.status(401).json({ error: "Auth required" }); return; }

    const [user] = await db.select().from(chatUsers).where(eq(chatUsers.id, userId)).limit(1);
    const subId = (user as any)?.stripeSubscriptionId;

    if (!stripe || !subId) {
      res.status(400).json({ error: "No active subscription or Stripe not configured" });
      return;
    }

    try {
      await stripe.subscriptions.cancel(subId);
      await db.execute(sql`
        UPDATE chat_users SET subscription_tier = 'free'
        WHERE id = ${userId}
      `);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  console.log("[Axiom Studio] Stripe routes registered");
}
