import os

BASE = r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src\app'

providers = r'''"use client";

import { useEffect, useState } from "react";
import {
  defaultProviderConfigs,
  loadProviderConfigs,
  saveProviderConfigs,
  type ProviderConfig,
} from "@/lib/provider-storage";
import Sidebar from "@/components/Sidebar";

function toTextareaValue(models: string[]): string {
  return models.join("\n");
}

function fromTextareaValue(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>(defaultProviderConfigs);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    setProviders(loadProviderConfigs());
  }, []);

  const updateProvider = (id: ProviderConfig["id"], updates: Partial<ProviderConfig>) => {
    setProviders((current) =>
      current.map((provider) => (provider.id === id ? { ...provider, ...updates } : provider))
    );
  };

  const handleSave = () => {
    saveProviderConfigs(providers);
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  const handleReset = () => {
    setProviders(defaultProviderConfigs);
    saveProviderConfigs(defaultProviderConfigs);
    setSavedAt("");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, padding: "48px 10vw", maxWidth: "1100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "44px" }}>
          <div>
            <h1 className="text-headline" style={{ color: "var(--text-hero)" }}>Providers</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
              Configure provider connections. Keys stay in browser-local storage.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleReset}
              style={{
                padding: "10px 18px",
                background: "transparent",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                color: "var(--text-secondary)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: "10px 18px",
                background: "var(--accent)",
                color: "#080810",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>

        {savedAt && (
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
            Saved at {savedAt}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {providers.map((provider) => (
            <div key={provider.id} className="glass" style={{ padding: "22px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-hero)" }}>
                    {provider.label}
                  </h3>
                  <p className="text-small" style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                    {provider.baseUrl || "No base URL set"}
                  </p>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={provider.enabled}
                    onChange={(e) => updateProvider(provider.id, { enabled: e.target.checked })}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span className="text-small" style={{ color: "var(--text-secondary)" }}>Enabled</span>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label className="text-label" style={{ color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey}
                    onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                    placeholder={`Paste ${provider.label} key`}
                    className="glass-input"
                    style={{ width: "100%", padding: "10px 14px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label className="text-label" style={{ color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={provider.baseUrl}
                    onChange={(e) => updateProvider(provider.id, { baseUrl: e.target.value })}
                    className="glass-input"
                    style={{ width: "100%", padding: "10px 14px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label className="text-label" style={{ color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                  Models (one per line)
                </label>
                <textarea
                  value={toTextareaValue(provider.models)}
                  onChange={(e) => updateProvider(provider.id, { models: fromTextareaValue(e.target.value) })}
                  className="glass-input"
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", fontSize: "13px", fontFamily: "var(--font-mono)", resize: "vertical" }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
'''

with open(os.path.join(BASE, 'providers', 'page.tsx'), 'w') as f:
    f.write(providers)
print('providers/page.tsx done')
