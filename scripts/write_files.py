import os

nav_content = r'''"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Nav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header style={{ position: "fixed", top: "20px", left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center" }}>
      <nav className="glass-pill" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 10px" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-hero)", paddingRight: "14px", borderRight: "1px solid var(--glass-border)", textDecoration: "none" }}>Layman</Link>
        {["Chat", "Models", "Settings"].map((link) => (
          <Link key={link} href={`/${link.toLowerCase()}`} style={{ fontSize: "13px", color: "var(--text-secondary)", padding: "5px 14px", borderRadius: "30px", textDecoration: "none", transition: "color 0.2s ease, background 0.2s ease" }} onMouseEnter={(e) => { e.target.style.color = "var(--text-hero)"; e.target.style.background = "rgba(255,255,255,0.07)"; }} onMouseLeave={(e) => { e.target.style.color = "var(--text-secondary)"; e.target.style.background = "transparent"; }}>{link}</Link>
        ))}
        {user ? (
          <button onClick={() => supabase.auth.signOut()} style={{ marginLeft: "6px", padding: "6px 18px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--glass-border)", borderRadius: "30px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-display)", transition: "color 0.2s ease, border-color 0.2s ease" }} onMouseEnter={(e) => { e.target.style.color = "var(--text-hero)"; e.target.style.borderColor = "var(--glass-border-hover)"; }} onMouseLeave={(e) => { e.target.style.color = "var(--text-secondary)"; e.target.style.borderColor = "var(--glass-border)"; }}>Sign out</button>
        ) : (
          <Link href="/auth/signin" style={{ marginLeft: "6px", padding: "6px 18px", background: "var(--accent)", color: "#080810", border: "none", borderRadius: "30px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-display)", textDecoration: "none", transition: "transform 0.2s ease, box-shadow 0.2s ease" }} onMouseEnter={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 4px 16px rgba(232,232,232,0.15)"; }} onMouseLeave={(e) => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}>Sign in</Link>
        )}
      </nav>
    </header>
  );
}
'''

base = r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src\components'
with open(os.path.join(base, 'Nav.tsx'), 'w') as f:
    f.write(nav_content)
print('Nav.tsx done')
