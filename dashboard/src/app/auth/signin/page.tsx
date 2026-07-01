"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import Logo from "../../../components/Logo";

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

  const handleOAuth = async (provider: "google") => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", zIndex: 1 }}>
      <div className="glass" style={{ width: "100%", maxWidth: "400px", padding: "44px 40px" }}>
        <div style={{ marginBottom: "12px" }}>
          <Logo size={32} />
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "36px" }}>Sign in to continue</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          <button
            onClick={() => handleOAuth("google")}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
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
