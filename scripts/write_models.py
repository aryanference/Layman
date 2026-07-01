import os

BASE = r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src\app'

# Simple dark-themed wrapper for models page
models = r'''"use client";

import { useEffect, useState } from "react";
import { modelTiers, routePresets } from "@/lib/dashboard-data";
import Sidebar from "@/components/Sidebar";

export default function ModelsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, padding: "48px 10vw", maxWidth: "1100px" }}>
        <h1 className="text-headline" style={{ color: "var(--text-hero)", marginBottom: "8px" }}>Models</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "44px", fontSize: "15px" }}>
          Browse the available model tiers and their capabilities.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {modelTiers.map((tier) => (
            <div key={tier.name} className="glass" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span
                  className="text-label"
                  style={{
                    color: tier.difficulty === "HARD" ? "#f87171" : tier.difficulty === "INTERMEDIATE" ? "#f59e0b" : "#22c55e",
                  }}
                >
                  {tier.difficulty}
                </span>
                <h2 className="text-title" style={{ color: "var(--text-hero)" }}>{tier.name}</h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
                {tier.summary}
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                {tier.models.map((model) => (
                  <div
                    key={model.id}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-hero)" }}>
                        {model.name}
                      </span>
                      <span className="text-small" style={{ color: "var(--text-muted)" }}>
                        {model.provider}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                      <span className="text-small" style={{ color: "var(--text-secondary)" }}>{model.cost}</span>
                      <span className="text-small" style={{ color: "var(--text-secondary)" }}>{model.context}</span>
                      <span className="text-small" style={{ color: "var(--text-secondary)" }}>{model.latency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "48px" }}>
          <h2 className="text-title" style={{ color: "var(--text-hero)", marginBottom: "16px" }}>Route Presets</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {routePresets.map((preset) => (
              <div key={preset.id} className="glass" style={{ padding: "20px 24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-hero)", marginBottom: "6px" }}>
                  {preset.label}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  {preset.description}
                </p>
                <p className="text-small" style={{ color: "var(--text-muted)" }}>{preset.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
'''

with open(os.path.join(BASE, 'models', 'page.tsx'), 'w') as f:
    f.write(models)
print('models/page.tsx done')
