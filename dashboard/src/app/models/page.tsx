"use client";

import { useEffect, useState } from "react";
import { fetchFreeModels, type FreeModel } from "../../lib/api/backend";
import Sidebar from "../../components/Sidebar";

function difficultyColor(difficulty: string | null): string {
  if (difficulty === "HARD") return "#f87171";
  if (difficulty === "INTERMEDIATE") return "#f59e0b";
  return "#22c55e";
}

export default function ModelsPage() {
  const [models, setModels] = useState<FreeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFreeModels().then((data) => {
      setModels(data);
      setLoading(false);
    });
  }, []);

  const filteredModels = models.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()));
  const simple = filteredModels.filter((m) => m.difficulty === "SIMPLE");
  const intermediate = filteredModels.filter((m) => m.difficulty === "INTERMEDIATE");
  const hard = filteredModels.filter((m) => m.difficulty === "HARD");

  const renderTier = (title: string, tierModels: FreeModel[], difficulty: string) => (
    <div className="glass" style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span
          className="text-label"
          style={{
            color: difficultyColor(difficulty),
          }}
        >
          {difficulty}
        </span>
        <h2 className="text-title" style={{ color: "var(--text-hero)", display: "flex", alignItems: "center", gap: "8px" }}>
          {title}
          <span style={{ fontSize: "12px", background: "var(--accent-dim)", color: "var(--accent)", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>{tierModels.length}</span>
        </h2>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
        {difficulty === "SIMPLE"
          ? "Fast responses for facts, summarization, classification, and small rewrites."
          : difficulty === "INTERMEDIATE"
            ? "Reasoning-focused models for coding, analysis, and multi-step composition."
            : "Premium-capability models for complex planning, deep debugging, and high-stakes outputs."}
      </p>
      {tierModels.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No models in this tier.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {tierModels.map((model, i) => (
            <div
              key={model.id}
              className="anim-msg-in"
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--glass-border)",
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
                animationFillMode: "forwards"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-hero)" }}>
                  {model.name}
                </span>
                <span className="text-small" style={{ color: "var(--text-muted)" }}>
                  {model.id}
                </span>
              </div>
              <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                <span className="text-small" style={{ color: "var(--text-secondary)" }}>Free</span>
                <span className="text-small" style={{ color: "var(--text-secondary)" }}>{model.context_length.toLocaleString()} ctx</span>
                <span className="text-small" style={{ color: "var(--text-secondary)" }}>{model.description || "OpenRouter free model"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{ marginLeft: "260px", flex: 1, padding: "48px 10vw", maxWidth: "1100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "44px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 className="text-headline" style={{ color: "var(--text-hero)", marginBottom: "8px" }}>Models</h1>
            <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "15px" }}>
              Live free trending models from OpenRouter. Auto-detected by difficulty.
            </p>
          </div>
          <div className="glass" style={{ display: "flex", alignItems: "center", padding: "8px 16px", borderRadius: "12px", width: "100%", maxWidth: "300px" }}>
            <span style={{ fontSize: "16px", opacity: 0.5, marginRight: "8px" }}>ðŸ”</span>
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--text-hero)",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                fontFamily: "var(--font-display)"
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading free models...</div>
        ) : models.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>No free models available. Check your backend connection.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {renderTier("Simple", simple, "SIMPLE")}
            {renderTier("Intermediate", intermediate, "INTERMEDIATE")}
            {renderTier("Hard", hard, "HARD")}
          </div>
        )}
      </main>
    </div>
  );
}
