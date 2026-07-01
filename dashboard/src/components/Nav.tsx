"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: "16px",
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <nav
        className="glass-pill"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "6px 8px",
          maxWidth: "100%",
        }}
      >
        <Link
          href="/"
          style={{
            padding: "4px 12px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Logo size={28} />
        </Link>

        <div
          style={{
            width: "1px",
            height: "20px",
            background: "rgba(0,0,0,0.08)",
            margin: "0 4px",
          }}
        />

        {["Chat", "Models", "Settings"].map((link) => (
          <Link
            key={link}
            href={`/${link.toLowerCase()}`}
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              padding: "6px 14px",
              borderRadius: "30px",
              textDecoration: "none",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "var(--text-primary)";
              el.style.background = "rgba(0,0,0,0.04)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "var(--text-secondary)";
              el.style.background = "transparent";
            }}
          >
            {link}
          </Link>
        ))}

        <div
          style={{
            width: "1px",
            height: "20px",
            background: "rgba(0,0,0,0.08)",
            margin: "0 4px",
          }}
        />

        {user ? (
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              marginLeft: "2px",
              padding: "6px 16px",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "var(--text-primary)";
              el.style.borderColor = "rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "var(--text-secondary)";
              el.style.borderColor = "rgba(0,0,0,0.08)";
            }}
          >
            Sign out
          </button>
        ) : (
          <Link
            href="/auth/signin"
            style={{
              marginLeft: "2px",
              padding: "6px 18px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              textDecoration: "none",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 12px rgba(26,26,46,0.12)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-1px)";
              el.style.boxShadow = "0 4px 16px rgba(26,26,46,0.18)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "";
              el.style.boxShadow = "0 2px 12px rgba(26,26,46,0.12)";
            }}
          >
            Sign in
          </Link>
        )}

        <div
          style={{
            width: "1px",
            height: "20px",
            background: "rgba(0,0,0,0.08)",
            margin: "0 4px",
          }}
        />
        
        <ThemeToggle />
      </nav>
    </header>
  );
}
