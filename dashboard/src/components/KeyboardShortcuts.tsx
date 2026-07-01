"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface KeyboardShortcutsProps {
  onNewChat?: () => void;
  onExport?: () => void;
  onToggleSidebar?: () => void;
  onFocusInput?: () => void;
}

export default function KeyboardShortcuts({
  onNewChat,
  onExport,
  onToggleSidebar,
  onFocusInput,
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const allCommands = [
    { id: "new-chat", label: "New Chat", icon: "plus", action: () => { onNewChat?.(); setIsOpen(false); } },
    { id: "focus-input", label: "Focus Input", icon: "message", action: () => { onFocusInput?.(); setIsOpen(false); } },
    { id: "export-chat", label: "Export Chat (MD)", icon: "download", action: () => { onExport?.(); setIsOpen(false); } },
    { id: "toggle-sidebar", label: "Toggle Sidebar", icon: "sidebar", action: () => { onToggleSidebar?.(); setIsOpen(false); } },
    { id: "toggle-theme", label: "Toggle Dark Mode", icon: "moon", action: () => { 
        const root = document.documentElement;
        if (root.classList.contains("dark")) {
          root.classList.remove("dark");
          localStorage.setItem("theme", "light");
        } else {
          root.classList.add("dark");
          localStorage.setItem("theme", "dark");
        }
        setIsOpen(false);
      }
    },
    { id: "go-models", label: "Go to Models", icon: "box", action: () => { router.push("/models"); setIsOpen(false); } },
    { id: "go-settings", label: "Go to Settings", icon: "settings", action: () => { router.push("/settings"); setIsOpen(false); } },
  ];

  const filteredCommands = allCommands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (isOpen) {
        if (e.key === "Escape") {
          setIsOpen(false);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "12vh",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass"
            style={{
              width: "100%",
              maxWidth: "500px",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              background: "var(--bg-elevated)",
            }}
          >
            <input
              autoFocus
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "20px",
                fontSize: "16px",
                border: "none",
                background: "transparent",
                color: "var(--text-hero)",
                outline: "none",
                borderBottom: "1px solid var(--glass-border)",
                fontFamily: "var(--font-display)",
              }}
            />
            <div style={{ padding: "8px", maxHeight: "300px", overflowY: "auto" }}>
              {filteredCommands.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                  No commands found
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      background: idx === selectedIndex ? "var(--accent-dim)" : "transparent",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      color: idx === selectedIndex ? "var(--accent)" : "var(--text-primary)",
                      fontSize: "14px",
                      fontWeight: 500,
                      transition: "all 0.1s ease",
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span style={{ fontSize: "18px", opacity: 0.7 }}>
                      {cmd.icon === "plus" && "ï¼‹"}
                      {cmd.icon === "message" && "ðŸ’¬"}
                      {cmd.icon === "download" && "â¬‡ï¸"}
                      {cmd.icon === "sidebar" && "â—¨"}
                      {cmd.icon === "moon" && "ðŸŒ™"}
                      {cmd.icon === "box" && "ðŸ“¦"}
                      {cmd.icon === "settings" && "âš™ï¸"}
                    </span>
                    {cmd.label}
                  </button>
                ))
              )}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--glass-border)", fontSize: "12px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>Use <strong>â†‘â†“</strong> to navigate</span>
              <span><strong>Enter</strong> to select</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
