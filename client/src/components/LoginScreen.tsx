/**
 * Axiom Studio — Login / Signup Screen
 * Full-bleed Ken Burns slideshow background with glassmorphic form.
 * Mobile-first, no emojis, ultra-premium.
 */
import { useState, useEffect, useCallback } from "react";
import { Brain, LogIn, UserPlus, Loader2 } from "lucide-react";

interface Props {
  onLogin: (username: string, password: string) => Promise<string | null>;
  onSignup: (username: string, email: string, password: string, displayName: string) => Promise<string | null>;
}

const SLIDES = ["/bg/slide-1.png", "/bg/slide-2.png", "/bg/slide-3.png", "/bg/slide-4.png"];
const SLIDE_DURATION = 7000;

/** Ken Burns background — crossfade + slow pan/zoom */
function KenBurnsBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  // Each slide gets a unique transform origin for variety
  const transforms = [
    { from: "scale(1.0) translate(0%, 0%)", to: "scale(1.15) translate(-2%, -1%)" },
    { from: "scale(1.15) translate(0%, 0%)", to: "scale(1.0) translate(2%, 1%)" },
    { from: "scale(1.0) translate(-1%, 1%)", to: "scale(1.12) translate(1%, -2%)" },
    { from: "scale(1.12) translate(1%, -1%)", to: "scale(1.0) translate(-1%, 2%)" },
  ];

  return (
    <>
      <style>{`
        @keyframes kenburns-0 { from { transform: ${transforms[0].from}; } to { transform: ${transforms[0].to}; } }
        @keyframes kenburns-1 { from { transform: ${transforms[1].from}; } to { transform: ${transforms[1].to}; } }
        @keyframes kenburns-2 { from { transform: ${transforms[2].from}; } to { transform: ${transforms[2].to}; } }
        @keyframes kenburns-3 { from { transform: ${transforms[3].from}; } to { transform: ${transforms[3].to}; } }
      `}</style>
      {SLIDES.map((src, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: "-10%",
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === active ? 1 : 0,
            transition: "opacity 1.8s ease-in-out",
            animation: `kenburns-${i} ${SLIDE_DURATION}ms ease-in-out infinite alternate`,
            willChange: "transform, opacity",
          }}
        />
      ))}
      {/* Dark overlay for readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.85) 100%)",
      }} />
      {/* Subtle color wash */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at top center, rgba(6,182,212,0.08) 0%, transparent 60%)",
      }} />
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box" as const,
  fontFamily: "inherit",
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

  return (
    <div style={{
      height: "100vh", width: "100vw",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Ken Burns Background */}
      <KenBurnsBackground />

      {/* Form Card */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "420px",
        margin: "0 16px",
      }}>
        <div style={{
          background: "rgba(8,12,21,0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "40px 32px",
          backdropFilter: "blur(40px) saturate(1.5)",
          WebkitBackdropFilter: "blur(40px) saturate(1.5)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05) inset",
        }}>
          {/* Logo */}
          <div style={{
            width: "60px", height: "60px", margin: "0 auto 20px", borderRadius: "16px",
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(6,182,212,0.3)",
          }}>
            <Brain style={{ width: 28, height: 28, color: "white" }} />
          </div>

          <h1 style={{
            fontSize: "26px", fontWeight: 800, textAlign: "center", marginBottom: "4px",
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}>
            Axiom Studio
          </h1>
          <p style={{
            fontSize: "13px", color: "rgba(255,255,255,0.35)", textAlign: "center",
            marginBottom: "28px", letterSpacing: "0.01em",
          }}>
            Multi-Agent AI Development Environment
          </p>

          {/* Mode Toggle */}
          <div style={{
            display: "flex", gap: "4px", marginBottom: "24px", padding: "4px",
            background: "rgba(255,255,255,0.03)", borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: 600, transition: "all 0.3s ease",
                  background: mode === m ? "linear-gradient(135deg, #0891b2, #7c3aed)" : "transparent",
                  color: mode === m ? "white" : "rgba(255,255,255,0.35)",
                  boxShadow: mode === m ? "0 4px 16px rgba(6,182,212,0.2)" : "none",
                }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" style={inputStyle} autoComplete="username"
                onFocus={(e) => { e.target.style.borderColor = "rgba(6,182,212,0.4)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              />
            </div>

            {mode === "signup" && (
              <>
                <div style={{ marginBottom: "14px" }}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email" style={inputStyle} autoComplete="email"
                    onFocus={(e) => { e.target.style.borderColor = "rgba(6,182,212,0.4)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                  />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name (optional)" style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(6,182,212,0.4)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: "20px" }}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" style={inputStyle} autoComplete={mode === "login" ? "current-password" : "new-password"}
                onFocus={(e) => { e.target.style.borderColor = "rgba(6,182,212,0.4)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              />
              {mode === "signup" && (
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "6px", paddingLeft: "4px" }}>
                  Minimum 8 characters
                </p>
              )}
            </div>

            {error && (
              <p style={{
                color: "#f87171", fontSize: "13px", textAlign: "center", marginBottom: "14px",
                padding: "10px", borderRadius: "10px", background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}>{error}</p>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: "14px",
              background: "linear-gradient(135deg, #0891b2, #7c3aed)",
              color: "white", fontWeight: 600, fontSize: "14px", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 24px rgba(6,182,212,0.3)",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.2s, transform 0.2s",
              fontFamily: "inherit",
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
            <p style={{
              fontSize: "12px", color: "rgba(6,182,212,0.5)", textAlign: "center", marginTop: "18px",
              letterSpacing: "0.01em",
            }}>
              New accounts start on the Free tier with 30 messages per month
            </p>
          )}

          <div style={{
            marginTop: "20px", paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", textAlign: "center", lineHeight: 1.5 }}>
              Trust Layer SSO — works across Signal Chat, TrustGen 3D, and all DarkWave Studios apps
            </p>
          </div>
        </div>

        <p style={{
          fontSize: "11px", color: "rgba(255,255,255,0.12)", textAlign: "center", marginTop: "20px",
          letterSpacing: "0.02em",
        }}>
          DarkWave Studios LLC | 2026
        </p>
      </div>
    </div>
  );
}
