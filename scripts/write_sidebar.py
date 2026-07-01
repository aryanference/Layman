import os

BASE = r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src'

# ============== Sidebar.tsx ==============
sidebar = r'''"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  loadUserSessions,
} from "@/lib/history-storage";

export default function Sidebar({ onNewChat }: { onNewChat?: () => void }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [sessions, setSessions] = useState<Array<{ id: string; title: string | null }>>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    loadUserSessions().then(setSessions);

    return () => listener.subscription.unsubscribe();
  }, []);

  const isActive = (href: string) => {
    if (href === "/chat") return pathname === "/chat" || pathname === "/";
    return pathname === href;
  };

  return (
    <aside
      style={{
        width: "220px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        borderRight: "1px solid var(--glass-border)",
        background: "rgba(8,8,16,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        zIndex: 40,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "17px",
          color: "var(--text-hero)",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--glass-border)",
          marginBottom: "20px",
        }}
      >
        Layman
      </div>

      <button
        onClick={onNewChat}
        style={{
          width: "100%",
          padding: "11px 16px",
          marginBottom: "20px",
          background: "var(--accent-dim)",
          border: "1px solid var(--accent-glow)",
          borderRadius: "10px",
          color: "var(--accent)",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--font-display)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(232,232,232,0.12)"; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "var(--accent-dim)"; }}
      >
        + New chat
      </button>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
        {sessions.map((s) => (
          <button
            key={s.id}
            style={{
              width: "100%",
              padding: "9px 12px",
              textAlign: "left",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              color: "var(--text-secondary)",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "var(--glass-fill-hover)"; (e.target as HTMLElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}
          >
            {s.title || "Untitled chat"}
          </button>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
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
              padding: "8px 12px",
              borderRadius: "8px",
              background: isActive(item.href) ? "var(--glass-fill-hover)" : "transparent",
              transition: "color 0.2s ease, background 0.2s ease",
            }}
          >
            {item.label}
          </Link>
        ))}
        {user && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 12px" }}>
            {user.email}
          </div>
        )}
      </div>
    </aside>
  );
}
'''

with open(os.path.join(BASE, 'components', 'Sidebar.tsx'), 'w') as f:
    f.write(sidebar)
print('Sidebar.tsx done')
