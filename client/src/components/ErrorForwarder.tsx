/**
 * Axiom Studio — Error Forwarder
 * Captures errors and sends them to the active agent with full context.
 * Can be triggered from a "Send to Agent" button or programmatically.
 */
import { useState } from "react";
import { AlertTriangle, Send, X, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onSendError: (errorContext: string, userMessage: string) => void;
  isStreaming: boolean;
}

export default function ErrorForwarder({ onSendError, isStreaming }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [userNote, setUserNote] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSend = () => {
    if (!errorText.trim()) return;
    onSendError(errorText.trim(), userNote.trim() || "Please analyze this error and suggest a fix.");
    setErrorText("");
    setUserNote("");
    setIsOpen(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setErrorText(text);
    } catch {}
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 14px", borderRadius: "10px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
          color: "#fca5a5", fontSize: "12px", fontWeight: 500,
          cursor: "pointer", transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
      >
        <AlertTriangle style={{ width: 14, height: 14 }} />
        Send Error to Agent
      </button>
    );
  }

  return (
    <div style={{
      background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
      borderRadius: "12px", padding: "16px", marginBottom: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle style={{ width: 16, height: 16, color: "#f87171" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#fca5a5" }}>Forward Error to Agent</span>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: "4px" }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Error input */}
      <textarea
        value={errorText}
        onChange={(e) => setErrorText(e.target.value)}
        placeholder="Paste error message, stack trace, or console output here..."
        style={{
          width: "100%", minHeight: expanded ? "200px" : "80px", padding: "12px",
          borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
          color: "#e5e7eb", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
          resize: "vertical", outline: "none", boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "rgba(239,68,68,0.3)"}
        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
        <button onClick={handlePaste} style={{
          padding: "6px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)",
          fontSize: "11px", cursor: "pointer",
        }}>
          Paste from clipboard
        </button>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.3)",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px",
        }}>
          {expanded ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Optional note */}
      <input
        type="text"
        value={userNote}
        onChange={(e) => setUserNote(e.target.value)}
        placeholder="Add context (optional): 'This happens when I click submit...'"
        style={{
          width: "100%", padding: "10px 12px", marginTop: "10px",
          borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)",
          color: "white", fontSize: "12px", outline: "none", boxSizing: "border-box",
        }}
      />

      {/* Send */}
      <button
        onClick={handleSend}
        disabled={!errorText.trim() || isStreaming}
        style={{
          width: "100%", marginTop: "12px", padding: "10px",
          borderRadius: "8px", background: errorText.trim() ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "rgba(255,255,255,0.04)",
          color: "white", fontWeight: 600, fontSize: "13px", border: "none",
          cursor: errorText.trim() && !isStreaming ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          opacity: errorText.trim() && !isStreaming ? 1 : 0.4,
        }}
      >
        <Send style={{ width: 14, height: 14 }} />
        Analyze Error
      </button>
    </div>
  );
}
