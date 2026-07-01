import type { MessageMetadata } from "../../lib/dashboard-data";
import { supabase } from "../../lib/supabase";

export interface BackendChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface BackendChatAttachment {
  name: string;
  content: string;
  type: string;
}

export interface BackendChatProvider {
  id: string;
  label: string;
  api_key: string;
  base_url: string;
  protocol: "openai" | "anthropic";
}

export interface BackendChatRequest {
  message: string;
  conversation_history: BackendChatHistoryItem[];
  selected_model: string;
  selected_provider: BackendChatProvider;
  attachments: BackendChatAttachment[];
}

export interface FreeModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  difficulty: string | null;
}

export interface BackendChatResponse {
  response?: string;
  metadata?: Partial<MessageMetadata>;
}

export interface ModelError {
  type: "model_error" | "model_timeout";
  status?: number;
  suggestion: string;
  detail: string;
}

const LOCAL_BACKEND_API_URL = "http://127.0.0.1:8000";
const CHAT_API_PATH = "/api/chat";
const REQUEST_TIMEOUT_MS = 35_000;

function getConfiguredBackendApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ""
  );
}

function getBackendApiUrl(): string {
  const configuredUrl = getConfiguredBackendApiUrl();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return LOCAL_BACKEND_API_URL;
  }

  throw new Error(
    "Backend URL is not configured for this deployment. Set NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL to your backend URL.",
  );
}

function resolveConfiguredChatUrl(configuredUrl: string): string {
  const normalizedUrl = configuredUrl.trim();

  try {
    const parsedUrl = new URL(normalizedUrl);
    const normalizedPath = parsedUrl.pathname.replace(/\/+$/, "") || "/";

    if (
      normalizedPath === "/" ||
      normalizedPath === "/api" ||
      normalizedPath === "/chat"
    ) {
      parsedUrl.pathname = CHAT_API_PATH;
      return parsedUrl.toString();
    }

    if (normalizedPath === CHAT_API_PATH) {
      parsedUrl.pathname = CHAT_API_PATH;
      return parsedUrl.toString();
    }

    parsedUrl.pathname = `${normalizedPath}${CHAT_API_PATH}`;
    return parsedUrl.toString();
  } catch {
    const baseUrl = normalizedUrl.replace(/\/+$/, "");

    if (
      baseUrl.endsWith(CHAT_API_PATH) ||
      baseUrl.endsWith("/chat") ||
      baseUrl.endsWith("/api")
    ) {
      return `${baseUrl.replace(/(\/chat|\/api|\/api\/chat)$/, "")}${CHAT_API_PATH}`;
    }

    return `${baseUrl}${CHAT_API_PATH}`;
  }
}

function getChatApiUrl(): string {
  return resolveConfiguredChatUrl(getBackendApiUrl());
}

async function parseBackendResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {
    detail: (await response.text()) || "Unexpected response from the FastAPI backend.",
  };
}

function isModelError(detail: string): ModelError | null {
  if (detail.startsWith("model_timeout:")) {
    return {
      type: "model_timeout",
      suggestion: "This model did not respond in time. Try mistral-7b or llama-3-8b instead.",
      detail,
    };
  }

  if (detail.startsWith("model_error")) {
    return {
      type: "model_error",
      suggestion: "This model may be unavailable. Try switching to a different model.",
      detail,
    };
  }

  return null;
}

export async function sendChatRequest(
  payload: BackendChatRequest,
  clientId: string,
  retryOnNetworkDrop = true,
): Promise<BackendChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  const chatApiUrl = getChatApiUrl();

  const { data: { session } } = await supabase.auth.getSession();
  const authHeader = session?.access_token ? `Bearer ${session.access_token}` : "";

  // Debug logging for auth issues
  if (typeof window !== "undefined") {
    console.log("[Layman API] URL:", chatApiUrl);
    console.log("[Layman API] Has auth:", !!authHeader);
    if (authHeader) {
      const tokenParts = authHeader.split(".");
      console.log("[Layman API] Token parts:", tokenParts.length);
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("[Layman API] Token aud:", payload.aud);
        console.log("[Layman API] Token sub:", payload.sub?.slice(0, 8) + "...");
        console.log("[Layman API] Token exp:", new Date(payload.exp * 1000).toISOString());
      } catch { /* ignore */ }
    }
  }

  try {
    response = await fetch(chatApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-layman-client": clientId,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        "model_timeout: The request timed out after 35 seconds. Try a lighter model or try again.",
      );
    }

    if (error instanceof TypeError && retryOnNetworkDrop) {
      return sendChatRequest(payload, clientId, false);
    }

    if (error instanceof TypeError) {
      const backendApiUrl = getConfiguredBackendApiUrl() || chatApiUrl;

      throw new Error(
        `Unable to reach the backend at ${backendApiUrl}. The frontend expects the chat endpoint at ${chatApiUrl}.`,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await parseBackendResponse(response);

  if (!response.ok) {
    const detail =
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof (data as { detail?: unknown }).detail === "string" &&
      (data as { detail: string }).detail.trim()
        ? (data as { detail: string }).detail
        : `Request failed with status ${response.status}.`;

    if (response.status === 429) {
      const err = new Error(detail) as Error & { isGuestLimit?: boolean };
      err.isGuestLimit = true;
      throw err;
    }

    const modelError = isModelError(detail);

    if (modelError) {
      const error = new Error(detail) as Error & { modelError: ModelError };
      error.modelError = modelError;
      throw error;
    }

    throw new Error(detail);
  }

  return data as BackendChatResponse;
}

export async function fetchFreeModels(): Promise<FreeModel[]> {
  const baseUrl = getBackendApiUrl();
  const url = `${baseUrl.replace(/\/$/, "")}/api/models/free`;

  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) return [];
    return (await response.json()) as FreeModel[];
  } catch {
    return [];
  }
}

export async function detectDifficulty(message: string): Promise<string> {
  const baseUrl = getBackendApiUrl();
  const url = `${baseUrl.replace(/\/$/, "")}/api/detect-difficulty`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) return "SIMPLE";
    const data = (await response.json()) as { difficulty: string };
    return data.difficulty || "SIMPLE";
  } catch {
    return "SIMPLE";
  }
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: (metadata: Partial<MessageMetadata>) => void;
  onError: (error: Error) => void;
}

export async function sendChatStream(
  payload: BackendChatRequest,
  clientId: string,
  callbacks: StreamCallbacks,
): Promise<void> {
  const baseUrl = getBackendApiUrl();
  const url = `${baseUrl.replace(/\/$/, "")}/api/chat/stream`;

  const { data: { session } } = await supabase.auth.getSession();
  const authHeader = session?.access_token ? `Bearer ${session.access_token}` : "";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-layman-client": clientId,
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Stream failed: ${text}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6);
        if (jsonStr === "[DONE]") continue;

        try {
          const data = JSON.parse(jsonStr) as { chunk?: string; done?: boolean; metadata?: Partial<MessageMetadata>; error?: string; status?: number };

          if (data.error) {
            callbacks.onError(new Error(data.error));
            return;
          }

          if (data.chunk) {
            callbacks.onChunk(data.chunk);
          }

          if (data.done) {
            callbacks.onDone(data.metadata || {});
            return;
          }
        } catch {
          // ignore malformed lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
