"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ProTextType from "../components/ProTextType";
import { OrbitingCircles } from "../components/ui/orbiting-circles";
import {
  OpenAIIcon,
  AnthropicIcon,
  GeminiIcon,
  MetaIcon,
  MistralIcon,
  DeepSeekIcon,
  GroqIcon,
  CohereIcon,
  PerplexityIcon,
  TogetherIcon,
} from "../components/ProviderIcons";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/chat");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}
      >
        Loading
      </div>
    );
  }

  return (
    <>
      <Nav />
      <div
        className="hero-bg"
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Orbiting circles on the right */}
        <div
          className="anim-fade"
          style={{
            position: "absolute",
            top: "50%",
            right: "5vw",
            transform: "translateY(-50%)",
            width: "min(50vw, 500px)",
            height: "min(50vw, 500px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Inner orbit */}
            <OrbitingCircles radius={90} duration={18} iconSize={40} speed={0.8}>
              <OpenAIIcon size={22} />
              <AnthropicIcon size={22} />
              <GeminiIcon size={22} />
              <MetaIcon size={22} />
              <MistralIcon size={22} />
            </OrbitingCircles>

            {/* Outer orbit */}
            <OrbitingCircles
              radius={160}
              duration={28}
              iconSize={40}
              speed={0.6}
              reverse
            >
              <DeepSeekIcon size={22} />
              <GroqIcon size={22} />
              <CohereIcon size={22} />
              <PerplexityIcon size={22} />
              <TogetherIcon size={22} />
              <OpenAIIcon size={22} />
            </OrbitingCircles>

            {/* Center node */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 24px rgba(26,26,46,0.2)",
                position: "relative",
                zIndex: 2,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 8L27.5 20.5L40 24L27.5 27.5L24 40L20.5 27.5L8 24L20.5 20.5L24 8Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main content */}
        <section
          style={{
            position: "relative",
            zIndex: 1,
            padding: "120px 6vw 80px",
            maxWidth: "560px",
          }}
        >
          {/* Badge */}
          <div className="anim-fade" style={{ marginBottom: "28px" }}>
            <span
              className="glass-pill text-label"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "inline-block",
                }}
              />
              AI chat, routed intelligently
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-display anim-hero"
            style={{
              color: "var(--text-hero)",
              marginBottom: "24px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            Think
            <br />
            <span style={{ color: "var(--accent)" }}>deeper,</span>
            <br />
            faster.
          </h1>

          {/* Typing effect */}
          <div className="anim-sub" style={{ marginBottom: "20px" }}>
            <ProTextType
              texts={[
                "GPT-4, Claude, Gemini â€” all in one place",
                "Smart routing picks the best model for you",
                "No API keys needed to get started",
              ]}
              typingSpeed={40}
              deletingSpeed={25}
              pauseDuration={1800}
              textColor="var(--text-secondary)"
              cursorColor="var(--accent)"
              fontSize="clamp(16px, 1.4vw, 20px)"
              fontWeight={500}
            />
          </div>

          {/* Description */}
          <p
            className="anim-sub"
            style={{
              maxWidth: "400px",
              marginBottom: "32px",
              fontSize: "14px",
              lineHeight: "1.8",
              color: "var(--text-muted)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
            }}
          >
            One interface. Every major model. Route your prompts to the right AI
            automatically â€” or pick one yourself.
          </p>

          {/* CTA row */}
          <div
            className="anim-cta"
            style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}
          >
            <a
              href="/chat"
              style={{
                padding: "14px 24px",
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
                boxShadow: "0 4px 20px rgba(26,26,46,0.15)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 8px 30px rgba(26,26,46,0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "";
                el.style.boxShadow = "0 4px 20px rgba(26,26,46,0.15)";
              }}
            >
              Start chatting free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="/models"
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "14px 18px",
                borderRadius: "14px",
                transition: "color 0.2s ease, background 0.2s ease",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--text-primary)";
                el.style.background = "rgba(0,0,0,0.03)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--text-secondary)";
                el.style.background = "transparent";
              }}
            >
              Browse models
              <span style={{ fontSize: "18px", lineHeight: 1 }}>â†’</span>
            </a>
          </div>
        </section>
      </div>

      {/* Feature Cards Section */}
      <section style={{ padding: "100px 6vw", background: "var(--bg-surface)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 className="text-title" style={{ color: "var(--text-hero)", fontSize: "2.5rem", marginBottom: "16px", letterSpacing: "-0.02em" }}>Built for power users.</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
              Experience a chat interface designed for speed, flexibility, and intelligent routing.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {[
              { title: "Auto-Routing", desc: "Instantly routes your prompt to the best available free model based on task complexity.", icon: "âš¡" },
              { title: "Multi-Provider", desc: "Bring your own API keys for OpenAI, Anthropic, Groq, and more. All stored locally.", icon: "ðŸ”‘" },
              { title: "Real-time Streaming", desc: "Experience ultra-fast, word-by-word streaming responses with zero buffering.", icon: "ðŸŒŠ" },
            ].map((feat, i) => (
              <div key={i} className="glass" style={{ padding: "32px", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "16px", transition: "transform 0.2s ease", cursor: "default" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                <div style={{ fontSize: "32px", background: "var(--accent-dim)", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px" }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>{feat.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built With Section */}
      <section style={{ padding: "80px 6vw", background: "var(--bg)", borderTop: "1px solid var(--glass-border)", textAlign: "center" }}>
        <h3 style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "32px", fontWeight: 600 }}>Powered By</h3>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "40px", flexWrap: "wrap", opacity: 0.6 }}>
          <span style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--text-primary)" }}>Next.js</span>
          <span style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--text-primary)" }}>FastAPI</span>
          <span style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--text-primary)" }}>Tailwind CSS</span>
          <span style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--text-primary)" }}>Supabase</span>
          <span style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--text-primary)" }}>OpenRouter</span>
        </div>
      </section>

      <Footer />
    </>
  );
}
