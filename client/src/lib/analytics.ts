/**
 * Axiom Studio — Analytics Tracker
 * Auto-tracks page views and exposes event tracking.
 * Mirrors DWTL pattern: fires on mount, tracks session, sends to /api/analytics.
 * DarkWave Studios LLC — Copyright 2026
 */

let sessionId = localStorage.getItem("ax_session_id");
if (!sessionId) {
  sessionId = `ax_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("ax_session_id", sessionId);
}

function getUserId(): string | null {
  try {
    const token = localStorage.getItem("axiom_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

/**
 * Track a page view
 */
export function trackPageView(path?: string): void {
  const payload = {
    path: path || window.location.pathname,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent,
    sessionId,
    userId: getUserId(),
  };

  // Fire and forget — don't block the UI
  fetch("/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

/**
 * Track a custom event
 */
export function trackEvent(
  name: string,
  category?: string,
  properties?: Record<string, any>
): void {
  const payload = {
    name,
    category: category || "general",
    properties: properties || {},
    sessionId,
    userId: getUserId(),
  };

  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

/**
 * Standard events for Axiom Studio
 */
export const AxiomEvents = {
  LOGIN: "user_login",
  SIGNUP: "user_signup",
  LOGOUT: "user_logout",
  MESSAGE_SENT: "message_sent",
  AGENT_SELECTED: "agent_selected",
  CONVERSATION_CREATED: "conversation_created",
  CONVERSATION_DELETED: "conversation_deleted",
  ARTIFACT_OPENED: "artifact_opened",
  SNIPPET_INSERTED: "snippet_inserted",
  SNIPPET_COPIED: "snippet_copied",
  ERROR_FORWARDED: "error_forwarded",
  BILLING_CLICKED: "billing_clicked",
  SMS_OPTIN: "sms_optin",
  TIER_UPGRADE: "tier_upgrade",
} as const;
