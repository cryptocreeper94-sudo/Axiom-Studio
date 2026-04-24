/**
 * Axiom Studio — Login / Signup Screen
 */
import { useState } from "react";
import { Brain, LogIn, UserPlus, Loader2 } from "lucide-react";

interface Props {
  onLogin: (username: string, password: string) => Promise<string | null>;
  onSignup: (username: string, email: string, password: string, displayName: string) => Promise<string | null>;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
};

export default function LoginScreen({ onLogin, onSignup }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let err: string | null;
    if (mode === "login") {
      err = await onLogin(username, password);
    } else {
      if (!email) { setError("Email is required"); setLoading(false); return; }
      if (password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
      err = await onSignup(username, email, password, displayName || username);
    }

    if (err) setError(err);
    setLoading(false);
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#06060a",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at top, rgba(6,182,212,0.08), transparent 50%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at bottom right, rgba(168,85,247,0.06), transparent 50%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: "420px", margin: "0 16px" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "40px 32px",
          backdropFilter: "blur(20px)",
        }}>
          {/* Logo */}
          <div style={{
            width: "64px", height: "64px", margin: "0 auto 24px", borderRadius: "16px",
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(6,182,212,0.25)",
          }}>
            <Brain style={{ width: 32, height: 32, color: "white" }} />
          </div>

          <h1 style={{
            fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "4px",
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Axiom Studio
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginBottom: "28px" }}>
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>

          {/* Mode Toggle */}
          <div style={{
            display: "flex", gap: "4px", marginBottom: "24px", padding: "4px",
            background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600, transition: "all 0.2s",
                background: mode === "login" ? "linear-gradient(135deg, #0891b2, #7c3aed)" : "transparent",
                color: mode === "login" ? "white" : "rgba(255,255,255,0.4)",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600, transition: "all 0.2s",
                background: mode === "signup" ? "linear-gradient(135deg, #0891b2, #7c3aed)" : "transparent",
                color: mode === "signup" ? "white" : "rgba(255,255,255,0.4)",
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            {mode === "signup" && (
              <>
                <div style={{ marginBottom: "14px" }}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email" style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.4)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name (optional)" style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.4)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: "16px" }}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              {mode === "signup" && (
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "6px" }}>
                  Minimum 8 characters
                </p>
              )}
            </div>

            {error && (
              <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center", marginBottom: "12px" }}>{error}</p>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: "12px",
              background: "linear-gradient(135deg, #0891b2, #7c3aed)",
              color: "white", fontWeight: 600, fontSize: "14px", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 20px rgba(6,182,212,0.25)",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
            }}>
              {loading
                ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                : mode === "login"
                  ? <LogIn style={{ width: 16, height: 16 }} />
                  : <UserPlus style={{ width: 16, height: 16 }} />
              }
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {mode === "signup" && (
            <p style={{ fontSize: "11px", color: "rgba(6,182,212,0.5)", textAlign: "center", marginTop: "16px" }}>
              🎁 New accounts receive 10 free credits
            </p>
          )}

          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", textAlign: "center", marginTop: "20px" }}>
            Trust Layer SSO — works with Signal Chat & DarkWave Studios
          </p>
        </div>

        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.1)", textAlign: "center", marginTop: "24px" }}>
          DarkWave Studios LLC © 2026
        </p>
      </div>
    </div>
  );
}
