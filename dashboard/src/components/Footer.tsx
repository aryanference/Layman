"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "40px 6vw",
        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", gap: "24px" }}>
        <a
          href="https://github.com/layman"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none", transition: "color 0.2s ease" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-hero)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/layman"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none", transition: "color 0.2s ease" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-hero)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
        >
          LinkedIn
        </a>
        <a
          href="https://layman.studio"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none", transition: "color 0.2s ease" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-hero)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
        >
          Portfolio
        </a>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
        Built by Layman Studio
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>
        Â© {new Date().getFullYear()} Layman. All rights reserved.
      </p>
    </footer>
  );
}
