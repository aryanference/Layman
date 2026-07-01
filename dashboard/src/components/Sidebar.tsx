"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import {
  loadUserSessions,
  deleteSession,
  updateSessionTitle,
} from "../lib/history-storage";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

interface Session {
  id: string;
  title: string | null;
  updated_at: string;
}

export default function Sidebar({
  onNewChat,
  onSelectSession,
  activeSessionId,
  onToggleCollapse,
}: {
  onNewChat?: () => void;
  onSelectSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  const refreshSessions = async () => {
    const data = await loadUserSessions();
    setSessions(data);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    refreshSessions();
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const startEdit = (s: Session) => {
    setEditingId(s.id);
    setEditValue(s.title || "Untitled chat");
  };

  const saveEdit = async (id: string) => {
    const ok = await updateSessionTitle(id, editValue.trim() || "Untitled chat");
    if (ok) {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: editValue.trim() || "Untitled chat" } : s))
      );
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteSession(id);
    if (ok) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        onNewChat?.();
      }
    }
    setDeleteConfirmId(null);
  };

  const isActive = (href: string) => {
    if (href === "/chat") return pathname === "/chat" || pathname === "/";
    return pathname === href;
  };

  const groupedSessions = useMemo(() => {
    const today: Session[] = [];
    const yesterday: Session[] = [];
    const previous7Days: Session[] = [];
    const older: Session[] = [];

    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    sessions.forEach(s => {
      const date = new Date(s.updated_at);
      if (date.toDateString() === todayStr) {
        today.push(s);
      } else if (date.toDateString() === yesterdayStr) {
        yesterday.push(s);
      } else if (date > weekAgo) {
        previous7Days.push(s);
      } else {
        older.push(s);
      }
    });

    return [
      { label: "Today", items: today },
      { label: "Yesterday", items: yesterday },
      { label: "Previous 7 Days", items: previous7Days },
      { label: "Older", items: older },
    ].filter(g => g.items.length > 0);
  }, [sessions]);

  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        borderRight: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        zIndex: 40,
      }}
    >
      <div style={{ paddingBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={28} />
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Hide sidebar"
            style={{
              padding: "6px",
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <path d="M16 15l-4-4 4-4"/>
            </svg>
          </button>
        )}
      </div>

      <button
        onClick={onNewChat}
        style={{
          width: "100%",
          padding: "10px 14px",
          marginBottom: "12px",
          background: "var(--accent)",
          border: "none",
          borderRadius: "10px",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--font-display)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s ease",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        New chat
      </button>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "8px" }}>
        {sessions.length === 0 && (
          <p style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 12px" }}>No chats yet</p>
        )}
        {groupedSessions.map(group => (
          <div key={group.label}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 10px", marginBottom: "4px" }}>
              {group.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((s) => {
                const isActiveSession = activeSessionId === s.id;
                const isDeleting = deleteConfirmId === s.id;

                return (
                  <div
                    key={s.id}
                    className="anim-fade"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      borderRadius: "8px",
                      background: isActiveSession ? "rgba(0,0,0,0.05)" : "transparent",
                      padding: editingId === s.id ? "4px 8px" : "0",
                      transition: "background 0.2s ease"
                    }}
                  >
                    {editingId === s.id ? (
                      <input
                        ref={editRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(s.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => saveEdit(s.id)}
                        style={{
                          flex: 1,
                          fontSize: "13px",
                          padding: "4px 6px",
                          borderRadius: "6px",
                          border: "1px solid var(--glass-border)",
                          background: "rgba(255,255,255,0.8)",
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-display)",
                          outline: "none",
                        }}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => onSelectSession?.(s.id)}
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            borderRadius: "8px",
                            color: isActiveSession ? "var(--text-hero)" : "var(--text-secondary)",
                            fontSize: "13px",
                            cursor: "pointer",
                            fontFamily: "var(--font-display)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            transition: "all 0.15s ease",
                            fontWeight: isActiveSession ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActiveSession) {
                              (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)";
                              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActiveSession) {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                            }
                          }}
                          title={s.title || "Untitled chat"}
                        >
                          {s.title || "Untitled chat"}
                        </button>

                        {isActiveSession && !isDeleting && (
                          <div style={{ display: "flex", gap: "2px", paddingRight: "4px" }}>
                            <button
                              onClick={() => startEdit(s)}
                              title="Rename"
                              style={{
                                padding: "4px",
                                background: "transparent",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                color: "var(--text-muted)",
                                fontSize: "11px",
                                lineHeight: 1,
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(s.id)}
                              title="Delete"
                              style={{
                                padding: "4px",
                                background: "transparent",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                color: "var(--text-muted)",
                                fontSize: "11px",
                                lineHeight: 1,
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#dc2626"; (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        )}

                        {isDeleting && (
                          <div style={{ display: "flex", gap: "4px", paddingRight: "4px" }}>
                            <button
                              onClick={() => handleDelete(s.id)}
                              style={{
                                padding: "3px 8px",
                                background: "rgba(220,38,38,0.1)",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                color: "#dc2626",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              style={{
                                padding: "3px 8px",
                                background: "rgba(0,0,0,0.04)",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                color: "var(--text-secondary)",
                                fontSize: "11px",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {[
          { label: "Chat", href: "/chat" },
          { label: "Models", href: "/models" },
          { label: "Providers", href: "/providers" },
          { label: "Settings", href: "/settings" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              fontSize: "13px",
              color: isActive(item.href) ? "var(--text-hero)" : "var(--text-secondary)",
              textDecoration: "none",
              padding: "7px 12px",
              borderRadius: "8px",
              background: isActive(item.href) ? "rgba(0,0,0,0.04)" : "transparent",
              fontWeight: isActive(item.href) ? 600 : 400,
              transition: "all 0.2s ease",
            }}
          >
            {item.label}
          </Link>
        ))}
        {user && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "7px 12px", marginTop: "4px" }}>
            {user.email}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", paddingRight: "8px" }}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
