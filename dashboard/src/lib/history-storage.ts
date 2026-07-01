"use client";

import type { RouteHistoryItem, RoutePresetId } from "../lib/dashboard-data";
import { supabase } from "../lib/supabase";

export const HISTORY_STORAGE_KEY = "meridian-history-v2";
export const DRAFT_STORAGE_KEY = "meridian-draft-v2";
export const PRESET_STORAGE_KEY = "meridian-preset-v2";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseHistory(value: string | null): RouteHistoryItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is RouteHistoryItem => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const candidate = item as Partial<RouteHistoryItem>;

      return (
        typeof candidate.id === "string" &&
        typeof candidate.query === "string" &&
        (candidate.responsePreview === undefined ||
          typeof candidate.responsePreview === "string") &&
        typeof candidate.model === "string" &&
        typeof candidate.provider === "string" &&
        typeof candidate.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export function loadStoredHistory(): RouteHistoryItem[] {
  if (!canUseStorage()) {
    return [];
  }

  return parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
}

export function saveStoredHistory(items: RouteHistoryItem[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(items.slice(0, 24)),
  );
}

export function appendHistoryItem(item: RouteHistoryItem): void {
  const existing = loadStoredHistory();
  saveStoredHistory([item, ...existing]);
}

export function deleteHistoryItem(id: string): void {
  const existing = loadStoredHistory();
  saveStoredHistory(existing.filter((item) => item.id !== id));
}

export function clearStoredHistory(): void {
  saveStoredHistory([]);
}

export function loadComposerDraft(): string {
  if (!canUseStorage()) {
    return "";
  }

  return window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "";
}

export function saveComposerDraft(value: string): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(DRAFT_STORAGE_KEY, value);
}

export function loadPresetPreference(): RoutePresetId {
  if (!canUseStorage()) {
    return "balanced";
  }

  const saved = window.localStorage.getItem(PRESET_STORAGE_KEY);
  return saved === "economy" || saved === "quality" ? saved : "balanced";
}

export function savePresetPreference(value: RoutePresetId): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PRESET_STORAGE_KEY, value);
}

export async function createSession(title: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: user.id, title })
    .select("id")
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  model?: string,
): Promise<void> {
  await supabase.from("messages").insert({
    session_id: sessionId,
    role,
    content,
    model: model ?? null,
  });
}

export async function loadMessages(sessionId: string): Promise<
  Array<{ id: string; role: string; content: string; model: string | null; created_at: string }>
> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, model, created_at")
    .eq("session_id", sessionId)
    .order("created_at");

  if (error || !data) {
    return [];
  }

  return data;
}

export async function loadUserSessions(): Promise<
  Array<{ id: string; title: string | null; created_at: string; updated_at: string }>
> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);
  return !error;
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ title })
    .eq("id", sessionId);
  return !error;
}
