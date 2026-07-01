import os

BASE = r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src'

# ============== auth/signin/page.tsx ==============
signin = r'''"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", zIndex: 1 }}>
      <div className="glass" style={{ width: "100%", maxWidth: "400px", padding: "44px 40px" }}>
        <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-hero)", marginBottom: "8px" }}>Layman</div>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "36px" }}>Sign in to continue</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {["Google", "GitHub"].map((provider) => (
            <button
              key={provider}
              onClick={() => handleOAuth(provider.toLowerCase() as "google" | "github")}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--glass-border)",
                borderRadius: "10px",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.target as HTMLElement).style.borderColor = "var(--glass-border-hover)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.target as HTMLElement).style.borderColor = "var(--glass-border)"; }}
            >
              Continue with {provider}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
          <span className="text-small" style={{ color: "var(--text-muted)" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
        </div>

        <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            placeholder="you@example.com"
            className="glass-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", fontSize: "14px", display: "block" }}
          />
          <input
            type="password"
            placeholder="Password"
            className="glass-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", fontSize: "14px", display: "block" }}
          />
          {error && <p style={{ color: "var(--error)", fontSize: "13px" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: "var(--accent)",
              color: "#080810",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-display)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-small" style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "20px" }}>
          No account? <Link href="/auth/signup" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
'''

with open(os.path.join(BASE, 'app', 'auth', 'signin', 'page.tsx'), 'w') as f:
    f.write(signin)
print('auth/signin/page.tsx done')
