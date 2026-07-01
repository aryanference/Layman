import os

BASE = r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src\app'

history = r'''"use client";

import { useEffect, useState } from "react";
import { loadStoredHistory, clearStoredHistory, deleteHistoryItem } from "@/lib/history-storage";
import { formatRelativeTime, type RouteHistoryItem } from "@/lib/dashboard-data";
import Sidebar from "@/components/Sidebar";

export default function HistoryPage() {
  const [items, setItems] = useState<RouteHistoryItem[]>([]);

  useEffect(() => {
    setItems(loadStoredHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    setItems(loadStoredHistory());
  };

  const handleClear = () => {
    clearStoredHistory();
    setItems([]);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, padding: "48px 10vw", maxWidth: "1100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "44px" }}>
          <div>
            <h1 className="text-headline" style={{ color: "var(--text-hero)" }}>History</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Your recent conversations.</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                color: "var(--text-secondary)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>No history yet. Start chatting to see your conversations here.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {items.map((item) => (
              <div key={item.id} className="glass" style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-hero)", marginBottom: "4px" }}>
                      {item.query}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                      {item.responsePreview}
                    </p>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <span className="text-small" style={{ color: "var(--text-muted)" }}>{item.model}</span>
                      <span className="text-small" style={{ color: "var(--text-muted)" }}>{item.tokens} tokens</span>
                      <span className="text-small" style={{ color: "var(--text-muted)" }}>{formatRelativeTime(item.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: "4px 10px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
'''

with open(os.path.join(BASE, 'history', 'page.tsx'), 'w') as f:
    f.write(history)
print('history/page.tsx done')
