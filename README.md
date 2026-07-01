<div align="center">

# Layman

**AI Chat. Routed Intelligently.**

[![Stack](https://img.shields.io/badge/stack-Next.js%2016-black?style=flat-square&logo=next.js&logoColor=white)]()
[![Stack](https://img.shields.io/badge/backend-FastAPI-black?style=flat-square&logo=fastapi&logoColor=white)]()
[![Stack](https://img.shields.io/badge/models-OpenRouter-black?style=flat-square&logo=openai&logoColor=white)]()
[![Stack](https://img.shields.io/badge/auth-Supabase-black?style=flat-square&logo=supabase&logoColor=white)]()

</div>

---

Layman is an intelligent AI chat router that automatically selects the best free model for your prompt, with fallback to user-configured providers. It features a Next.js dashboard, a FastAPI backend with streaming support, and Supabase-backed auth and chat history.

Built by Layman Studio.

![Layman Interface](./preview.jpg)

## Features

- **Auto Model Routing** — Detects prompt difficulty (SIMPLE / INTERMEDIATE / HARD) and picks the best free model automatically
- **Free Model Aggregation** — Live free model catalog from OpenRouter, cached and tiered by capability
- **Streaming Responses** — Real-time Server-Sent Events (SSE) for smooth, word-by-word output
- **Multi-Provider Support** — OpenRouter, OpenAI, Anthropic, Groq, Together, Fireworks, Mistral, xAI, Qwen, and custom OpenAI/Anthropic-compatible endpoints
- **Guest Mode** — 20 free requests without signup; upgrade to unlimited by signing in
- **Persistent Chat History** — Supabase-backed sessions and messages with full CRUD
- **Session Sidebar** — Collapsible sidebar to browse, rename, and delete past conversations
- **Custom Provider Keys** — Bring your own API keys for any supported provider
- **Smart Fallbacks** — If a model fails, automatically retries with alternative models from the same tier
- **Rich Markdown Rendering** — Code blocks with copy buttons, syntax highlighting, tables, and inline formatting
- **Responsive Full-Screen Chat** — Toggle sidebar for a distraction-free, full-width chat interface
- **Rate Limiting & Key Routing** — IP-based guest quotas, per-user key storage, and shared-key fallbacks
- **Dark Mode** — Toggleable dark mode with animated transitions
- **Chat Export** — Download chats as Markdown or JSON
- **Response Analytics** — View token usage, generation time, and word count
- **Keyboard Shortcuts** — Command palette (Ctrl+K) for power users

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Backend**: FastAPI, Uvicorn, HTTPX, Pydantic
- **Infrastructure**: Supabase (auth + Postgres), OpenRouter (free model gateway)

## Setup & Run

1. Install dependencies:
```bash
npm --prefix dashboard install
python -m pip install -r backend/requirements.txt
```

2. Create a `.env` file at the root based on `.env.example`.

3. Run the application:
```bash
npm run dev
```

## Copyright
Copyright © 2026 Layman Studio. All rights reserved.
