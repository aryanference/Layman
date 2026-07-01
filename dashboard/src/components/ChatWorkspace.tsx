"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  createSession,
  loadComposerDraft,
  saveComposerDraft,
  saveMessage,
  loadMessages,
} from "../lib/history-storage";
import { supabase } from "../lib/supabase";
import { sendChatStream, fetchFreeModels, type ModelError, type FreeModel } from "../lib/api/backend";
import { getActiveCustomProviders } from "../lib/provider-storage";
import Sidebar from "../components/Sidebar";
import KeyboardShortcuts from "../components/KeyboardShortcuts";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  difficulty?: string;
  tokens_used?: number;
  generation_time?: number;
}

interface ModelOption {
  id: string;
  name: string;
  providerId: string;
  providerLabel: string;
  difficulty?: string | null;
}

function createId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function difficultyColor(d: string | null | undefined): string {
  if (d === "HARD") return "#f87171";
  if (d === "INTERMEDIATE") return "#f59e0b";
  return "#22c55e";
}

/* ------------------------------------------------------------------ */
// Extract plain text from React nodes (handles highlighted spans from rehype-highlight)
function getTextFromNodes(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextFromNodes).join("");
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props.children) {
      return getTextFromNodes(props.children);
    }
  }
  return "";
}

/* ------------------------------------------------------------------ */
// Copy button for code blocks inside ReactMarkdown
function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const code = getTextFromNodes(children);
  const lang = className?.replace("language-", "") || "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative", margin: "12px 0", borderRadius: "10px", overflow: "hidden", background: "#1a1a2e" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 14px",
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: "11px",
            color: copied ? "#22c55e" : "var(--text-muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            transition: "color 0.2s ease",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        className={className}
        style={{
          margin: 0,
          padding: "14px 16px",
          overflowX: "auto",
          fontSize: "13px",
          lineHeight: "1.6",
          fontFamily: "var(--font-mono)",
          color: "#e2e8f0",
        }}
      >
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
// Rich markdown renderer
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className, children, ...props }: any) {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                style={{
                  background: "rgba(0,0,0,0.06)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "0.9em",
                  fontFamily: "var(--font-mono)",
                }}
                {...props}
              >
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        pre({ children }: any) {
          return <>{children}</>;
        },
        p({ children }: any) {
          return <p style={{ margin: "0 0 10px 0", lineHeight: "1.7" }}>{children}</p>;
        },
        ul({ children }: any) {
          return <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>{children}</ul>;
        },
        ol({ children }: any) {
          return <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>{children}</ol>;
        },
        li({ children }: any) {
          return <li style={{ margin: "4px 0", lineHeight: "1.6" }}>{children}</li>;
        },
        h1({ children }: any) {
          return <h1 style={{ fontSize: "18px", fontWeight: 700, margin: "16px 0 8px" }}>{children}</h1>;
        },
        h2({ children }: any) {
          return <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "14px 0 8px" }}>{children}</h2>;
        },
        h3({ children }: any) {
          return <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "12px 0 6px" }}>{children}</h3>;
        },
        blockquote({ children }: any) {
          return (
            <blockquote
              style={{
                borderLeft: "3px solid var(--accent)",
                margin: "10px 0",
                padding: "4px 14px",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              {children}
            </blockquote>
          );
        },
        table({ children }: any) {
          return (
            <div style={{ overflowX: "auto", margin: "12px 0" }}>
              <table style={{ borderCollapse: "collapse", fontSize: "13px", width: "100%" }}>
                {children}
              </table>
            </div>
          );
        },
        thead({ children }: any) {
          return <thead style={{ background: "rgba(0,0,0,0.04)" }}>{children}</thead>;
        },
        th({ children }: any) {
          return (
            <th style={{ border: "1px solid rgba(0,0,0,0.08)", padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>
              {children}
            </th>
          );
        },
        td({ children }: any) {
          return (
            <td style={{ border: "1px solid rgba(0,0,0,0.08)", padding: "8px 12px" }}>
              {children}
            </td>
          );
        },
        hr() {
          return <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "16px 0" }} />;
        },
        a({ href, children }: any) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: "3px" }}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ------------------------------------------------------------------ */
// Memoized message row
const ChatMessage = memo(function ChatMessage({ msg }: { msg: Message }) {
  return (
    <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
      <div
        className={msg.role === "assistant" ? "glass" : ""}
        style={{
          maxWidth: "78%",
          padding: msg.role === "user" ? "12px 16px" : "14px 18px",
          borderRadius: "14px",
          background: msg.role === "user" ? "var(--accent)" : undefined,
          color: msg.role === "user" ? "#fff" : "var(--text-primary)",
          fontSize: "15px",
          lineHeight: "1.65",
          boxShadow: msg.role === "user" ? "0 4px 16px rgba(26,26,46,0.12)" : undefined,
          overflowWrap: "break-word",
          minWidth: 0,
        }}
      >
        {msg.role === "user" ? (
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
        ) : (
          <MarkdownContent content={msg.content} />
        )}
          {msg.role === "assistant" && msg.model && (
            <div
              style={{
                marginTop: "10px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                minWidth: 0,
              }}
            >
              <span className="text-small" style={{ color: "var(--text-muted)", overflowWrap: "break-word", minWidth: 0, flex: 1 }}>{msg.model}</span>
            {msg.difficulty && (
              <span
                className="text-small"
                style={{
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: `${difficultyColor(msg.difficulty)}15`,
                  color: difficultyColor(msg.difficulty),
                  fontWeight: 600,
                  fontSize: "10px",
                  textTransform: "uppercase",
                }}
              >
                {msg.difficulty}
              </span>
            )}
            {msg.tokens_used !== undefined && (
              <span className="text-small" style={{ color: "var(--text-muted)", marginLeft: "auto" }}>
                {msg.tokens_used} tokens {msg.generation_time ? `Â· ${(msg.generation_time / 1000).toFixed(2)}s` : ""} Â· {msg.content.split(/\s+/).filter(w => w.length > 0).length} words
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelError, setModelError] = useState<ModelError | null>(null);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [detectedDifficulty, setDetectedDifficulty] = useState<string | null>(null);
  const [lastUsedModel, setLastUsedModel] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Streaming state â€” separate from messages to avoid re-rendering stored messages
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Throttling refs
  const pendingTextRef = useRef("");
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamStartTimeRef = useRef(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNearBottomRef = useRef(true);

  /* ---- Model options ---- */
  useEffect(() => {
    async function buildOptions() {
      const freeModels = await fetchFreeModels();
      const customProviders = getActiveCustomProviders();
      const options: ModelOption[] = [];

      freeModels.forEach((m) => {
        options.push({
          id: m.id,
          name: m.name,
          providerId: "openrouter",
          providerLabel: "OpenRouter Free",
          difficulty: m.difficulty,
        });
      });

      customProviders.forEach((p) => {
        p.models.forEach((mid) => {
          options.push({ id: mid, name: mid, providerId: p.id, providerLabel: p.label, difficulty: undefined });
        });
      });

      setModelOptions(options);
      if (!selectedModel && options.length > 0) setSelectedModel(options[0].id);
    }
    buildOptions();
  }, []);

  /* ---- Auth ---- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  /* ---- Draft ---- */
  useEffect(() => {
    setInput(loadComposerDraft());
  }, []);
  useEffect(() => {
    saveComposerDraft(input);
  }, [input]);

  /* ---- Textarea resize ---- */
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "0px";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
  }, [input]);

  /* ---- Scroll handling ---- */
  const scrollToBottom = useCallback(() => {
    if (!isNearBottomRef.current) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }, 30);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, streamingText, scrollToBottom]);

  /* ---- Scroll position tracking ---- */
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const threshold = 100;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  /* ---- Helpers ---- */
  const resetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setModelError(null);
    setGuestLimitReached(false);
    setSessionId(null);
    setDetectedDifficulty(null);
    setLastUsedModel(null);
    setStreamingText("");
    setIsStreaming(false);
    pendingTextRef.current = "";
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
  }, []);

  const handleSelectSession = useCallback(async (sid: string) => {
    setSessionId(sid);
    setMessages([]);
    setModelError(null);
    setGuestLimitReached(false);
    setDetectedDifficulty(null);
    setLastUsedModel(null);
    setStreamingText("");
    setIsStreaming(false);

    const dbMessages = await loadMessages(sid);
    setMessages(
      dbMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        model: m.model ?? undefined,
      }))
    );
  }, []);

  const getProviderForModel = useCallback(
    (modelId: string) => {
      const option = modelOptions.find((o) => o.id === modelId);
      if (!option || option.providerId === "openrouter") {
        return { id: "openrouter", label: "OpenRouter", api_key: "", base_url: "https://openrouter.ai/api/v1", protocol: "openai" as const };
      }
      const custom = getActiveCustomProviders().find((p) => p.id === option.providerId);
      if (custom) {
        return { id: custom.id, label: custom.label, api_key: custom.apiKey, base_url: custom.baseUrl, protocol: custom.protocol };
      }
      return { id: "openrouter", label: "OpenRouter", api_key: "", base_url: "https://openrouter.ai/api/v1", protocol: "openai" as const };
    },
    [modelOptions]
  );

  /* ---- Chat Export ---- */
  const handleExport = useCallback((format: "md" | "json") => {
    if (messages.length === 0) return;
    
    let content = "";
    let type = "";
    let ext = "";

    if (format === "md") {
      content = `# Chat Export\n\n`;
      messages.forEach(m => {
        content += `### ${m.role === "user" ? "User" : "Assistant"}\n\n`;
        if (m.role === "assistant" && m.model) {
          content += `*Model: ${m.model}*\n\n`;
        }
        content += `${m.content}\n\n---\n\n`;
      });
      type = "text/markdown";
      ext = "md";
    } else {
      content = JSON.stringify(messages, null, 2);
      type = "application/json";
      ext = "json";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split("T")[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]);

  /* ---- Throttled streaming update ---- */
  const throttledSetStreaming = useCallback((text: string) => {
    pendingTextRef.current = text;

    if (!updateTimeoutRef.current) {
      updateTimeoutRef.current = setTimeout(() => {
        setStreamingText(pendingTextRef.current);
        updateTimeoutRef.current = null;
      }, 80);
    }
  }, []);

  /* ---- Submit with streaming ---- */
  const submit = async () => {
    if (!input.trim() || loading) return;
    setModelError(null);
    setGuestLimitReached(false);
    setDetectedDifficulty(null);
    const userMessage = input.trim();
    let currentSessionId = sessionId;

    if (!currentSessionId && user) {
      const newId = await createSession(userMessage.slice(0, 60));
      if (newId) { setSessionId(newId); currentSessionId = newId; }
    }

    setInput("");
    setMessages((prev) => [...prev, { id: createId(), role: "user", content: userMessage }]);
    setLoading(true);
    setIsStreaming(true);
    setStreamingText("");
    pendingTextRef.current = "";
    streamStartTimeRef.current = Date.now();

    if (currentSessionId) {
      await saveMessage(currentSessionId, "user", userMessage, selectedModel);
    }

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const provider = getProviderForModel(selectedModel);

    let fullText = "";
    let streamMetadata: { difficulty?: string; model_used?: string; tier_name?: string; tokens_used?: number } = {};

    try {
      await sendChatStream(
        {
          message: userMessage,
          conversation_history: history,
          selected_model: selectedModel,
          selected_provider: provider,
          attachments: [],
        },
        createId(),
        {
          onChunk: (chunk) => {
            fullText += chunk;
            throttledSetStreaming(fullText);
          },
          onDone: (metadata) => {
            streamMetadata = metadata;
          },
          onError: (err) => {
            throw err;
          },
        }
      );

      // Ensure final text is set
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      setStreamingText("");
      setIsStreaming(false);
      setLoading(false);

      const modelUsed = streamMetadata.model_used || selectedModel || "auto";
      const difficulty = streamMetadata.difficulty || "SIMPLE";
      const tokensUsed = streamMetadata.tokens_used;
      const genTime = Date.now() - streamStartTimeRef.current;

      setDetectedDifficulty(difficulty);
      setLastUsedModel(modelUsed);

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "assistant", content: fullText, model: modelUsed, difficulty, tokens_used: tokensUsed, generation_time: genTime },
      ]);

      if (currentSessionId) {
        await saveMessage(currentSessionId, "assistant", fullText, modelUsed);
      }
    } catch (error) {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      setStreamingText("");
      setIsStreaming(false);
      setLoading(false);

      const detail = error instanceof Error ? error.message : "Request failed";
      if ((error as Error & { isGuestLimit?: boolean }).isGuestLimit) setGuestLimitReached(true);
      const modelErr = (error as Error & { modelError?: ModelError })?.modelError ?? null;
      if (modelErr) setModelError(modelErr);
      setMessages((prev) => [...prev, { id: createId(), role: "assistant", content: detail }]);
    }
  };

  /* ---- Grouped dropdown ---- */
  const grouped = modelOptions.reduce<Record<string, ModelOption[]>>((acc, opt) => {
    const key = opt.providerLabel;
    if (!acc[key]) acc[key] = [];
    acc[key].push(opt);
    return acc;
  }, {});

  /* ---------------------------------------------------------------- */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>
      <KeyboardShortcuts 
        onNewChat={resetChat} 
        onExport={() => handleExport("md")} 
        onToggleSidebar={() => setSidebarCollapsed(p => !p)}
        onFocusInput={() => inputRef.current?.focus()}
      />
      {!sidebarCollapsed && (
        <Sidebar onNewChat={resetChat} onSelectSession={handleSelectSession} activeSessionId={sessionId} onToggleCollapse={() => setSidebarCollapsed(true)} />
      )}

      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          title="Show sidebar"
          style={{
            position: "fixed",
            top: "16px",
            left: "16px",
            zIndex: 50,
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,1)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-hero)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.8)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <path d="M14 9l4 4-4 4"/>
          </svg>
        </button>
      )}

      <main style={{ marginLeft: sidebarCollapsed ? 0 : "260px", width: sidebarCollapsed ? "100vw" : "calc(100vw - 260px)", height: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, overflowX: "hidden", transition: "margin-left 0.3s ease, width 0.3s ease" }}>
        {/* Top bar */}
        <div style={{ padding: "12px 24px", paddingLeft: sidebarCollapsed ? "56px" : "24px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)", flexShrink: 0, transition: "padding-left 0.3s ease" }}>
          <span className="text-label" style={{ color: "var(--text-muted)", fontWeight: 500 }}>Model</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ padding: "6px 12px", fontSize: "13px", cursor: "pointer", borderRadius: "10px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)", color: "var(--text-primary)", fontFamily: "var(--font-display)", outline: "none", maxWidth: "320px" }}
          >
            <option value="">Auto-select best model</option>
            {Object.entries(grouped).map(([providerLabel, opts]) => (
              <optgroup key={providerLabel} label={providerLabel}>
                {opts.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}{opt.difficulty ? ` (${opt.difficulty.toLowerCase()})` : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {detectedDifficulty && (
            <span className="text-label" style={{ padding: "4px 10px", borderRadius: "6px", background: `${difficultyColor(detectedDifficulty)}15`, color: difficultyColor(detectedDifficulty), fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {detectedDifficulty}
            </span>
          )}

          {modelError && (
            <div style={{ marginLeft: "auto", padding: "7px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}>
              {modelError.suggestion}
              <button onClick={() => setModelError(null)} style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>Dismiss</button>
            </div>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => handleExport("md")} style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer", fontWeight: 500, transition: "all 0.2s ease" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)" }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}>
              Export
            </button>
            {user ? (
              <button onClick={() => supabase.auth.signOut()} style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer", fontWeight: 500, transition: "all 0.2s ease" }}>
                Sign out
              </button>
            ) : (
              <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })} style={{ padding: "6px 14px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Guest limit banner */}
        {guestLimitReached && (
          <div style={{ padding: "12px 24px", background: "rgba(239,68,68,0.04)", borderBottom: "1px solid rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>You have used all 20 free requests.</span>
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })} style={{ padding: "8px 18px", background: "var(--accent)", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none" }}>
              Create account
            </button>
          </div>
        )}

        {/* Messages */}
        <div onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", padding: "24px 6vw", display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", marginTop: "18vh", color: "var(--text-muted)" }}>
              <p className="text-headline" style={{ color: "var(--text-hero)", marginBottom: "12px", fontWeight: 700 }}>Ask anything</p>
              <p className="text-body" style={{ color: "var(--text-secondary)" }}>The best free model is chosen automatically based on your prompt.</p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}

          {/* Streaming message â€” rendered as a separate message bubble */}
          {isStreaming && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div className="glass" style={{ maxWidth: "78%", padding: "14px 18px", borderRadius: "14px", fontSize: "15px", lineHeight: "1.65", color: "var(--text-primary)" }}>
                {streamingText ? (
                  <MarkdownContent content={streamingText} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1s ease infinite" }} />
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1s ease 0.2s infinite" }} />
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1s ease 0.4s infinite" }} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: "14px 6vw 20px", flexShrink: 0 }}>
          <div className="glass" style={{ display: "flex", alignItems: "flex-end", gap: "12px", padding: "12px 16px", borderRadius: "18px" }}>
            <textarea
              ref={inputRef}
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              style={{ flex: 1, minHeight: "24px", maxHeight: "200px", resize: "none", border: "none", background: "transparent", fontSize: "15px", color: "var(--text-hero)", lineHeight: "1.6", padding: 0, outline: "none", fontFamily: "var(--font-display)" }}
            />
            <button
              onClick={submit}
              disabled={loading || !input.trim()}
              style={{ padding: "10px 20px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 600, cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "var(--font-display)", flexShrink: 0, opacity: loading || !input.trim() ? 0.45 : 1, transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 2px 12px rgba(26,26,46,0.12)" }}
            >
              Send
            </button>
          </div>
          <p className="text-small" style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}>
            {!user ? "20 free requests for guests. Sign in for unlimited access." : lastUsedModel ? `Last used: ${lastUsedModel}${detectedDifficulty ? ` Â· ${detectedDifficulty}` : ""}` : "Auto-routing to the best free model for your prompt."}
          </p>
        </div>
      </main>
    </div>
  );
}
