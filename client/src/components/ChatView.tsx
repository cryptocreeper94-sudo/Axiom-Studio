/**
 * Axiom Studio — Chat View
 * Streaming chat interface with markdown rendering.
 */
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertTriangle, Copy, Check, Brain, User, RotateCcw } from "lucide-react";
import { marked } from "marked";

interface Message {
  id: string;
  role: string;
  content: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  errorContext?: string;
  createdAt: string;
}

interface Props {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  agentName: string;
  agentColor: string;
  routeInfo: { model: string; agent: string; score: number; reason: string } | null;
  onSend: (message: string) => void;
  onRetry: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded hover:bg-white/10 transition text-white/30 hover:text-white/60"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function MessageBubble({ msg, agentName }: { msg: Message; agentName: string }) {
  const isUser = msg.role === "user";
  const html = !isUser ? marked.parse(msg.content, { async: false }) as string : "";

  return (
    <div className={`flex gap-3 py-4 px-4 ${isUser ? "" : "bg-white/[0.015]"}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? "bg-purple-600/20 text-purple-400" : "bg-cyan-600/20 text-cyan-400"
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-white/60">{isUser ? "You" : agentName}</span>
          {msg.model && <span className="text-[10px] text-white/20 font-mono">{msg.model}</span>}
          {msg.inputTokens != null && (
            <span className="text-[10px] text-white/15 font-mono">
              {msg.inputTokens}↓ {msg.outputTokens}↑
            </span>
          )}
        </div>
        {msg.errorContext && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 mb-2 text-xs text-red-300">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Error context attached</span>
          </div>
        )}
        {isUser ? (
          <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        ) : (
          <div className="agent-message text-sm text-white/80" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
      {!isUser && <CopyButton text={msg.content} />}
    </div>
  );
}

export default function ChatView({ messages, streamingContent, isStreaming, agentName, agentColor, routeInfo, onSend, onRetry }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const streamHtml = streamingContent ? marked.parse(streamingContent, { async: false }) as string : "";

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isStreaming ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${agentColor} flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-4`}>
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold gradient-text mb-2">{agentName}</h2>
              <p className="text-sm text-white/30 max-w-md">Ask me anything — architecture, debugging, code generation, Lume programming, or just thinking through a problem.</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} agentName={agentName} />
            ))}
            {isStreaming && streamingContent && (
              <div className="flex gap-3 py-4 px-4 bg-white/[0.015]">
                <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white/60">{agentName}</span>
                    {routeInfo && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                        {routeInfo.agent} · {routeInfo.score}/10 · {routeInfo.reason}
                      </span>
                    )}
                  </div>
                  <div className="agent-message text-sm text-white/80 cursor-blink" dangerouslySetInnerHTML={{ __html: streamHtml }} />
                </div>
              </div>
            )}
            {isStreaming && !streamingContent && (
              <div className="flex gap-3 py-4 px-4 bg-white/[0.015]">
                <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" style={{ animationDelay: "300ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" style={{ animationDelay: "600ms" }} />
                  </div>
                  <span className="text-xs text-white/30">{agentName} is thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] p-4 bg-[#080c15]">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask Axiom anything..."
              rows={1}
              className="w-full resize-none rounded-xl px-4 py-3 pr-12 text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 transition leading-relaxed"
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-cyan-500 hover:to-purple-500 transition"
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {messages.length > 0 && !isStreaming && (
            <button onClick={onRetry} className="p-3 rounded-xl glass text-white/30 hover:text-white/60 transition" title="Retry last">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-white/15 text-center mt-2">
          Axiom Studio by DarkWave Studios · Auto-routes to optimal model · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
