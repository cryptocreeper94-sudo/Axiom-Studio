/**
 * Axiom Studio — Subscription Tiers
 * Defines tier limits, pricing, and usage tracking.
 * 
 * DarkWave Studios LLC — Copyright 2026
 */

export interface TierConfig {
  id: string;
  name: string;
  price: number;            // monthly price in cents
  messagesPerMonth: number; // total auto-routed messages
  forceOpus: boolean;       // can force Opus manually
  overflowRate: number;     // cents per overflow message
  features: string[];
}

export const TIERS: Record<string, TierConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    messagesPerMonth: 30,
    forceOpus: false,
    overflowRate: 0, // no overflow, hard cap
    features: [
      "30 messages/month",
      "Auto-routed (Mini only)",
      "Basic chat",
    ],
  },
  developer: {
    id: "developer",
    name: "Developer",
    price: 2900, // $29
    messagesPerMonth: 300,
    forceOpus: false,
    overflowRate: 25, // $0.25/msg
    features: [
      "300 messages/month",
      "Auto-routed (Sonnet + Mini)",
      "Error forwarding",
      "Artifact viewer",
      "Overflow: $0.25/msg",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 5900, // $59
    messagesPerMonth: 1000,
    forceOpus: true,
    overflowRate: 20, // $0.20/msg
    features: [
      "1,000 messages/month",
      "Auto-routed (Opus + Sonnet + Mini)",
      "Force Opus mode",
      "Error forwarding",
      "Artifact viewer",
      "Overflow: $0.20/msg",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    price: 12900, // $129
    messagesPerMonth: 3000,
    forceOpus: true,
    overflowRate: 15, // $0.15/msg
    features: [
      "3,000 messages/month",
      "All models + Force Opus",
      "Priority routing",
      "Error forwarding",
      "Artifact viewer",
      "Overflow: $0.15/msg",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 24900, // $249
    messagesPerMonth: 999999, // effectively unlimited
    forceOpus: true,
    overflowRate: 0,
    features: [
      "Unlimited messages",
      "All models + Force Opus",
      "Priority routing",
      "Custom system prompts",
      "Dedicated support",
    ],
  },
};

// Stripe price IDs — populate after creating products in Stripe dashboard
export const STRIPE_PRICE_IDS: Record<string, string> = {
  developer: "",     // Fill after Stripe setup
  professional: "",  // Fill after Stripe setup
  business: "",      // Fill after Stripe setup
  enterprise: "",    // Fill after Stripe setup
};

export function getTierForUser(tier: string | null): TierConfig {
  return TIERS[tier || "free"] || TIERS.free;
}

export function canUseAgent(tier: TierConfig, agentId: string): boolean {
  if (agentId === "mini") return true;
  if (agentId === "auto") return true; // auto-router handles restrictions
  if (tier.id === "free") return agentId === "mini";
  if (tier.id === "developer") return agentId !== "opus" && agentId !== "lume";
  return true; // professional+ gets everything
}
