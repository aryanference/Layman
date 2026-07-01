from __future__ import annotations

import json
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .config import get_settings
from .schemas import ChatRequest, ChatResponse, HealthResponse, FreeModelInfo
from .services.chat import extract_client_id, process_chat_request, process_chat_request_stream
from .services.model_fetcher import fetch_free_models, detect_difficulty
from .middleware.auth import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Layman Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    configured = bool(settings.openrouter_api_key)

    return HealthResponse(
        status="ok" if configured else "degraded",
        llm_configured=configured,
        detail=(
            "FastAPI backend is ready to accept chat requests."
            if configured
            else "Missing OpenRouter API key. Set OPENROUTER_API_KEY in the repo .env file."
        ),
    )


@app.get("/api/models/free")
async def get_free_models() -> list[FreeModelInfo]:
    """Fetch live free trending models from OpenRouter (cached 5 min)."""
    models = await fetch_free_models()

    result = []
    for m in models:
        difficulty = m.get("difficulty", "SIMPLE")
        result.append(FreeModelInfo(
            id=m["id"],
            name=m.get("name", m["id"]),
            description=m.get("description", ""),
            context_length=m.get("context_length", 0),
            difficulty=difficulty,
        ))
    return result


@app.post("/api/detect-difficulty")
async def post_detect_difficulty(payload: dict) -> dict:
    """Detect difficulty of a message."""
    message = payload.get("message", "")
    difficulty = detect_difficulty(message)
    return {"difficulty": difficulty}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, http_request: Request) -> ChatResponse:
    auth_header = http_request.headers.get("Authorization", "")
    has_auth = auth_header.startswith("Bearer ")
    logger.info(f"[/api/chat] Request received. Auth present: {has_auth}")

    user_id = await get_current_user(http_request)
    logger.info(f"[/api/chat] User ID resolved: {user_id is not None}")

    client_id = extract_client_id(http_request.headers)
    request_ip = (
        http_request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or http_request.client.host if http_request.client else "unknown"
    )

    return await process_chat_request(
        request,
        client_id=client_id,
        origin=http_request.headers.get("origin"),
        user_id=user_id,
        request_ip=request_ip,
    )


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest, http_request: Request):
    """Stream chat response as Server-Sent Events."""
    user_id = await get_current_user(http_request)
    client_id = extract_client_id(http_request.headers)
    request_ip = (
        http_request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or http_request.client.host if http_request.client else "unknown"
    )

    async def event_generator():
        try:
            async for chunk in process_chat_request_stream(
                request,
                client_id=client_id,
                origin=http_request.headers.get("origin"),
                user_id=user_id,
                request_ip=request_ip,
            ):
                if isinstance(chunk, str):
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                elif isinstance(chunk, dict):
                    yield f"data: {json.dumps(chunk)}\n\n"
        except HTTPException as e:
            yield f"data: {json.dumps({'error': e.detail, 'status': e.status_code})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'status': 500})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )