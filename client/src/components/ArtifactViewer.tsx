/**
 * Axiom Studio — Artifact Viewer
 * Right panel for viewing generated artifacts (code, plans, diffs).
 * Extracts code blocks from agent responses.
 */
import { useState } from "react";
import { X, Copy, Check, FileCode, FileText, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface Artifact {
  language: string;
  code: string;
  filename?: string;
}

interface Props {
  messages: { role: string; content: string }[];
  isOpen: boolean;
  onClose: () => void;
}

function extractArtifacts(messages: { role: string; content: string }[]): Artifact[] {
  const artifacts: Artifact[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    let match;
    while ((match = codeBlockRegex.exec(msg.content)) !== null) {
      const language = match[1] || "text";
      const code = match[2].trim();
      if (code.length > 20) {
        // Try to extract filename from surrounding context
        const beforeMatch = msg.content.slice(Math.max(0, match.index - 100), match.index);
        const filenameMatch = beforeMatch.match(/[`"]([^`"]+\.\w+)[`"]/);
        artifacts.push({
          language,
          code,
          filename: filenameMatch?.[1],
        });
      }
    }
  }
  return artifacts;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "4px 10px", borderRadius: "6px",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
        color: copied ? "#4ade80" : "rgba(255,255,255,0.4)",
        fontSize: "11px", cursor: "pointer",
      }}
    >
      {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ArtifactViewer({ messages, isOpen, onClose }: Props) {
  const artifacts = extractArtifacts(messages);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!isOpen) return null;

  const current = artifacts[activeIdx];

  return (
    <div style={{
      width: "420px", height: "100%", display: "flex", flexDirection: "column",
      borderLeft: "1px solid rgba(255,255,255,0.06)", background: "#080c15",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileCode style={{ width: 16, height: 16, color: "#06b6d4" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
            Artifacts ({artifacts.length})
          </span>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.3)", padding: "4px",
        }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {artifacts.length === 0 ? (
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: "8px",
        }}>
          <FileText style={{ width: 32, height: 32, color: "rgba(255,255,255,0.06)" }} />
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.15)" }}>No code artifacts yet</p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.1)" }}>Code blocks from responses appear here</p>
        </div>
      ) : (
        <>
          {/* Navigation */}
          {artifacts.length > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <button
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                style={{
                  background: "none", border: "none", cursor: activeIdx > 0 ? "pointer" : "default",
                  color: activeIdx > 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)", padding: "4px",
                }}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                {activeIdx + 1} / {artifacts.length}
              </span>
              <button
                onClick={() => setActiveIdx(Math.min(artifacts.length - 1, activeIdx + 1))}
                disabled={activeIdx >= artifacts.length - 1}
                style={{
                  background: "none", border: "none",
                  cursor: activeIdx < artifacts.length - 1 ? "pointer" : "default",
                  color: activeIdx < artifacts.length - 1 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
                  padding: "4px",
                }}
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}

          {/* Artifact detail */}
          {current && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Meta bar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 16px", background: "rgba(255,255,255,0.02)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 600, textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: "4px",
                    background: "rgba(6,182,212,0.1)", color: "#67e8f9",
                  }}>
                    {current.language}
                  </span>
                  {current.filename && (
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {current.filename}
                    </span>
                  )}
                </div>
                <CopyBtn text={current.code} />
              </div>

              {/* Code */}
              <div style={{
                flex: 1, overflow: "auto", padding: "16px",
                background: "#0d1117",
              }}>
                <pre style={{
                  margin: 0, fontSize: "12px", lineHeight: 1.6,
                  fontFamily: "'JetBrains Mono', monospace", color: "#e6edf3",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {current.code}
                </pre>
              </div>
            </div>
          )}

          {/* Tab list */}
          <div style={{
            display: "flex", gap: "4px", padding: "8px 12px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            overflowX: "auto",
          }}>
            {artifacts.map((a, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  padding: "4px 10px", borderRadius: "6px", border: "none",
                  fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                  cursor: "pointer", whiteSpace: "nowrap",
                  background: i === activeIdx ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                  color: i === activeIdx ? "#67e8f9" : "rgba(255,255,255,0.3)",
                }}
              >
                {a.filename || `${a.language} #${i + 1}`}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
