import os

BASE = r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src'

settings = r'''"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

interface ApiKeyState {
  openrouter_key: string;
  openai_key: string;
  anthropic_key: string;
  gemini_key: string;
}

const EMPTY_KEYS: ApiKeyState = {
  openrouter_key: "",
  openai_key: "",
  anthropic_key: "",
  gemini_key: "",
};

const KEY_LABELS: Record<keyof ApiKeyState, string> = {
  openrouter_key: "OpenRouter",
  openai_key: "OpenAI",
  anthropic_key: "Anthropic",
  gemini_key: "Gemini",
};

function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "*".repeat(key.length);
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKeyState>(EMPTY_KEYS);
  const [savedKeys, setSavedKeys] = useState<ApiKeyState>(EMPTY_KEYS);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        supabase
          .from("user_api_keys")
          .select("openrouter_key, openai_key, anthropic_key, gemini_key")
          .eq("user_id", data.user.id)
          .maybeSingle()
          .then(({ data: keyData }) => {
            if (keyData) {
              const loaded: ApiKeyState = {
                openrouter_key: keyData.openrouter_key ?? "",
                openai_key: keyData.openai_key ?? "",
                anthropic_key: keyData.anthropic_key ?? "",
                gemini_key: keyData.gemini_key ?? "",
              };
              setKeys(loaded);
              setSavedKeys(loaded);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const updateKey = (field: keyof ApiKeyState, value: string) => {
    setKeys((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("user_api_keys")
      .upsert(
        {
          user_id: user.id,
          openrouter_key: keys.openrouter_key || null,
          openai_key: keys.openai_key || null,
          anthropic_key: keys.anthropic_key || null,
          gemini_key: keys.gemini_key || null,
        },
        { onConflict: "user_id" }
      );
    setSavedKeys({ ...keys });
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setSaving(false);
  };

  const handleReset = () => {
    setKeys({ ...savedKeys });
    setSavedAt("");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ marginLeft: "220px", flex: 1, padding: "48px 10vw", color: "var(--text-secondary)" }}>
          Loading...
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, padding: "48px 10vw", maxWidth: "900px" }}>
        <h1 className="text-headline" style={{ color: "var(--text-hero)", marginBottom: "8px" }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "44px", fontSize: "15px" }}>
          Manage your API keys and account preferences.
        </p>

        <section style={{ marginBottom: "48px" }}>
          <h2 className="text-title" style={{ color: "var(--text-hero)", marginBottom: "6px" }}>API Keys</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            Your keys are stored encrypted. Leave blank to use the Layman default key.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(Object.keys(KEY_LABELS) as Array<keyof ApiKeyState>).map((field) => (
              <div key={field} className="glass" style={{ padding: "18px 22px" }}>
                <label className="text-label" style={{ color: "var(--text-secondary)", display: "block", marginBottom: "10px" }}>
                  {KEY_LABELS[field]}
                  {savedKeys[field] && (
                    <span style={{ marginLeft: "8px", color: "var(--text-muted)", fontWeight: 400 }}>
                      {maskKey(savedKeys[field])}
                    </span>
                  )}
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="password"
                    placeholder={`${KEY_LABELS[field]} API key`}
                    className="glass-input"
                    value={keys[field]}
                    onChange={(e) => updateKey(field, e.target.value)}
                    style={{ flex: 1, padding: "10px 14px", fontSize: "13px", fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              onClick={handleSave}
              disabled={saving || !user}
              style={{
                padding: "10px 22px",
                background: "var(--accent)",
                color: "#080810",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: saving || !user ? "not-allowed" : "pointer",
                opacity: saving || !user ? 0.5 : 1,
              }}
            >
              {saving ? "Saving..." : "Save keys"}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: "10px 22px",
                background: "transparent",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                color: "var(--text-secondary)",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
            {savedAt && (
              <span style={{ fontSize: "13px", color: "var(--text-muted)", alignSelf: "center" }}>
                Saved at {savedAt}
              </span>
            )}
          </div>

          {!user && (
            <p style={{ color: "var(--warning)", fontSize: "13px", marginTop: "12px" }}>
              Sign in to save API keys.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-title" style={{ color: "var(--text-hero)", marginBottom: "6px" }}>Account</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            {user ? `Signed in as ${user.email}` : "Not signed in."}
          </p>
          {user && (
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                padding: "10px 22px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                borderRadius: "8px",
                color: "#f87171",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-display)",
              }}
            >
              Sign out
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
'''

with open(os.path.join(BASE, 'app', 'settings', 'page.tsx'), 'w') as f:
    f.write(settings)
print('settings/page.tsx done')
