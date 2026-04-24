/**
 * Axiom Studio — Profile Badge
 * Shows user avatar, tier badge, and usage stats in the sidebar.
 * DarkWave Studios LLC — Copyright 2026
 */
import { useState, useEffect } from "react";
import { User, Crown, Zap, Settings, Bell, LogOut } from "lucide-react";

interface Props {
  username: string;
  displayName?: string;
  token: string;
  onLogout: () => void;
  onSmsOptIn: () => void;
}

export default function ProfileBadge({ username, displayName, token, onLogout, onSmsOptIn }: Props) {
  const [sub, setSub] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/agent/subscription", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setSub)
      .catch(() => {});
  }, [token]);

  const tierColor: Record<string, string> = {
    free: "#94a3b8",
    developer: "#06b6d4",
    professional: "#a855f7",
    business: "#f59e0b",
    enterprise: "#ef4444",
  };

  const color = tierColor[sub?.tier || "free"] || "#94a3b8";
  const usagePercent = sub ? Math.min(100, (sub.messagesUsed / sub.messagesPerMonth) * 100) : 0;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 12px", borderRadius: "12px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
          cursor: "pointer", transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
      >
        {/* Avatar */}
        <div style={{
          width: "32px", height: "32px", borderRadius: "10px",
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
          border: `1px solid ${color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <User style={{ width: 14, height: 14, color }} />
        </div>

        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <p style={{
            fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.8)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {displayName || username}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{
              fontSize: "9px", fontWeight: 600, textTransform: "uppercase",
              color, letterSpacing: "0.04em",
            }}>
              {sub?.tierName || "Free"}
            </span>
            {sub?.tier !== "free" && (
              <Crown style={{ width: 9, height: 9, color }} />
            )}
          </div>
        </div>

        {/* Usage ring */}
        {sub && (
          <div style={{ position: "relative", width: "28px", height: "28px", flexShrink: 0 }}>
            <svg viewBox="0 0 28 28" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
              <circle cx="14" cy="14" r="11" fill="none" stroke={color} strokeWidth="2.5"
                strokeDasharray={`${usagePercent * 0.691} 69.1`}
                strokeLinecap="round"
              />
            </svg>
            <span style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "7px", fontWeight: 700, color: "rgba(255,255,255,0.4)",
            }}>
              {Math.round(usagePercent)}%
            </span>
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(false)} />
          <div style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
            background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px", padding: "6px", zIndex: 51,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}>
            {/* Usage stats */}
            {sub && (
              <div style={{
                padding: "10px 12px", marginBottom: "4px",
                borderRadius: "10px", background: "rgba(255,255,255,0.02)",
              }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>
                  Messages this month
                </p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>
                  {sub.messagesUsed} <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                    / {sub.messagesPerMonth === 999999 ? "Unlimited" : sub.messagesPerMonth}
                  </span>
                </p>
                <div style={{
                  width: "100%", height: "3px", borderRadius: "2px",
                  background: "rgba(255,255,255,0.06)", marginTop: "6px", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: "2px",
                    background: usagePercent > 90 ? "#ef4444" : color,
                    width: `${usagePercent}%`, transition: "width 0.3s",
                  }} />
                </div>
              </div>
            )}

            {[
              { icon: Bell, label: "SMS Notifications", action: () => { onSmsOptIn(); setMenuOpen(false); } },
              { icon: Settings, label: "Settings", action: () => {} },
              { icon: LogOut, label: "Sign Out", action: () => { onLogout(); setMenuOpen(false); }, danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px",
                  background: "transparent", border: "none", cursor: "pointer",
                  fontSize: "12px",
                  color: (item as any).danger ? "#f87171" : "rgba(255,255,255,0.5)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <item.icon style={{ width: 14, height: 14 }} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
