import os

BASE = r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src'

# ============== ChatWorkspace.tsx (complete rewrite) ==============
chat_workspace = r'''"use client";

import { useEffect, useRef, useState } from "react";
import {
  createSession,
  loadComposerDraft,
  loadMessages,
  loadUserSessions,
  saveComposerDraft,
  saveMessage,
} from "@/lib/history-storage";
import { supabase } from "@/lib/supabase";
import { sendChatRequest, type ModelError } from "@/lib/api/backend";
import Sidebar from "@/components/Sidebar";
import MarkdownPreview from "@/components/MarkdownPreview";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function createId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [modelError, setModelError] = useState<ModelError | null>(null);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState("meta-llama/llama-3-70b-instruct");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setInput(loadComposerDraft());
  }, []);

  useEffect(() => {
    saveComposerDraft(input);
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, loading]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "0px";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
  }, [input]);

  const resetChat = () => {
    setMessages([]);
    setStreamingText("");
    setInput("");
    setModelError(null);
    setGuestLimitReached(false);
    setSessionId(null);
  };

  const loadSession = async (id: string) => {
    setSessionId(id);
    const msgs = await loadMessages(id);
    setMessages(
      msgs.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    );
  };

  const submit = async () => {
    if (!input.trim() || loading) return;

    setModelError(null);
    setGuestLimitReached(false);

    const userMessage = input.trim();
    let currentSessionId = sessionId;

    if (!currentSessionId && user) {
      const newId = await createSession(userMessage.slice(0, 60));
      if (newId) {
        setSessionId(newId);
        currentSessionId = newId;
      }
    }

    setInput("");
    setMessages((prev) => [...prev, { id: createId(), role: "user", content: userMessage }]);
    setLoading(true);

    if (currentSessionId) {
      await saveMessage(currentSessionId, "user", userMessage, selectedModel);
    }

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendChatRequest(
        {
          message: userMessage,
          conversation_history: history,
          selected_model: selectedModel,
          selected_provider: {
            id: "openrouter",
            label: "OpenRouter",
            api_key: "",
            base_url: "https://openrouter.ai/api/v1",
            protocol: "openai" as const,
          },
          reasoning_effort: "medium",
          attachments: [],
        },
        createId(),
      );

      const content = response.response?.trim() || "No response";
      setStreamingText(content);

      // Simple streaming effect
      let displayed = "";
      const chars = content.split("");
      for (let i = 0; i < chars.length; i++) {
        displayed += chars[i];
        setStreamingText(displayed);
        await new Promise((r) => setTimeout(r, Math.random() * 8 + 2));
      }

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "assistant", content },
      ]);
      setStreamingText("");

      if (currentSessionId) {
        await saveMessage(currentSessionId, "assistant", content, selectedModel);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Request failed";

      if ((error as Error & { isGuestLimit?: boolean }).isGuestLimit) {
        setGuestLimitReached(true);
      }

      const modelErr = (error as Error & { modelError?: ModelError })?.modelError ?? null;
      if (modelErr) setModelError(modelErr);

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "assistant", content: detail },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onNewChat={resetChat} />
      <main
        style={{
          marginLeft: "220px",
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Model selector bar */}
        <div
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span className="text-label" style={{ color: "var(--text-muted)" }}>
            Model
          </span>
          <select
            className="glass-input"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              padding: "7px 14px",
              fontSize: "13px",
              cursor: "pointer",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-primary)",
            }}
          >
            <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
            <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="mistralai/mistral-7b-instruct">Mistral 7B</option>
            <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
          </select>

          {modelError && (
            <div
              style={{
                marginLeft: "auto",
                padding: "7px 14px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#f87171",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {modelError.suggestion}
              <button
                onClick={() => setModelError(null)}
                style={{
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontSize: "13px",
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            {user ? (
              <button
                onClick={() => supabase.auth.signOut()}
                style={{
                  padding: "6px 14px",
                  background: "transparent",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--text-hero)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
                style={{
                  padding: "6px 14px",
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#080810",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Guest limit banner */}
        {guestLimitReached && (
          <div
            style={{
              padding: "14px 28px",
              background: "rgba(232,232,232,0.04)",
              borderBottom: "1px solid rgba(232,232,232,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              You have used all 20 free requests.
            </span>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
                style={{
                  padding: "8px 20px",
                  background: "var(--accent)",
                  color: "#080810",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Create account
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 10vw",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", marginTop: "20vh", color: "var(--text-muted)" }}>
              <p className="text-headline" style={{ color: "var(--text-hero)", marginBottom: "16px" }}>
                Ask anything
              </p>
              <p className="text-body">Start a conversation with any model.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                className={msg.role === "assistant" ? "glass" : ""}
                style={{
                  maxWidth: "68%",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  background:
                    msg.role === "user"
                      ? "var(--accent-dim)"
                      : undefined,
                  border:
                    msg.role === "user"
                      ? "1px solid var(--accent-glow)"
                      : undefined,
                  fontSize: "15px",
                  lineHeight: "1.65",
                  color: "var(--text-primary)",
                }}
              >
                {msg.role === "user" ? (
                  <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
                ) : (
                  <MarkdownPreview content={msg.content} />
                )}
              </div>
            </div>
          ))}

          {streamingText && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                className="glass"
                style={{
                  maxWidth: "68%",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  fontSize: "15px",
                  lineHeight: "1.65",
                  color: "var(--text-primary)",
                }}
              >
                <MarkdownPreview content={streamingText} />
              </div>
            </div>
          )}

          {loading && !streamingText && (
            <div style={{ display: "flex", gap: "5px", padding: "0 4px" }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    animation: `blobDrift 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: "16px 10vw 28px", position: "relative" }}>
          <div
            className="glass"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "16px",
            }}
          >
            <textarea
              ref={inputRef}
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              style={{
                flex: 1,
                minHeight: "24px",
                maxHeight: "200px",
                resize: "none",
                border: "none",
                background: "transparent",
                fontSize: "15px",
                color: "var(--text-hero)",
                lineHeight: "1.6",
                padding: 0,
                outline: "none",
                fontFamily: "var(--font-display)",
              }}
            />
            <button
              onClick={submit}
              disabled={loading || !input.trim()}
              style={{
                padding: "9px 20px",
                background: "var(--accent)",
                color: "#080810",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontFamily: "var(--font-display)",
                flexShrink: 0,
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  (e.target as HTMLElement).style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = "";
              }}
            >
              Send
            </button>
          </div>
          <p
            className="text-small"
            style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}
          >
            {!user ? "20 free requests for guests. Sign in for unlimited access." : "Using your API key or the default."}
          </p>
        </div>
      </main>
    </div>
  );
}
'''

with open(os.path.join(BASE, 'components', 'ChatWorkspace.tsx'), 'w') as f:
    f.write(chat_workspace)
print('ChatWorkspace.tsx done')
