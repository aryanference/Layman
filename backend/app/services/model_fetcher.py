from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

import httpx

logger = logging.getLogger(__name__)

OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"
_CACHE_TTL_SECONDS = 300  # 5 minutes

_models_cache: list[dict[str, Any]] | None = None
_cache_timestamp: float = 0.0
_cache_lock = asyncio.Lock()


async def fetch_free_models() -> list[dict[str, Any]]:
    """Fetch free models from OpenRouter with TTL caching."""
    global _models_cache, _cache_timestamp

    now = time.time()
    if _models_cache is not None and (now - _cache_timestamp) < _CACHE_TTL_SECONDS:
        return _models_cache

    async with _cache_lock:
        # Double-check after acquiring lock
        now = time.time()
        if _models_cache is not None and (now - _cache_timestamp) < _CACHE_TTL_SECONDS:
            return _models_cache

        models = await _fetch_from_openrouter()
        if models:
            _models_cache = models
            _cache_timestamp = now
            logger.info(f"Cached {len(models)} free models from OpenRouter")
            return models

        # If fetch failed and we have stale cache, use it
        if _models_cache is not None:
            logger.warning("OpenRouter fetch failed, using stale cache")
            return _models_cache

        return []


async def _fetch_from_openrouter() -> list[dict[str, Any]]:
    """Internal: hit the OpenRouter models endpoint."""
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=5.0)) as client:
            response = await client.get(OPENROUTER_MODELS_URL)
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        logger.warning(f"Failed to fetch OpenRouter models: {e}")
        return []

    models = data.get("data") or []
    free_models: list[dict[str, Any]] = []

    for model in models:
        if not isinstance(model, dict):
            continue
        model_id = model.get("id", "")
        pricing = model.get("pricing", {})

        try:
            prompt_price = float(pricing.get("prompt", 1) or 1)
        except (ValueError, TypeError):
            prompt_price = 1.0
        try:
            completion_price = float(pricing.get("completion", 1) or 1)
        except (ValueError, TypeError):
            completion_price = 1.0

        is_free = ":free" in str(model_id).lower() or (prompt_price == 0 and completion_price == 0)

        if is_free:
            ctx = model.get("context_length", 0)
            difficulty = _infer_difficulty(ctx)
            free_models.append({
                "id": model_id,
                "name": model.get("name", model_id),
                "description": model.get("description", ""),
                "context_length": ctx,
                "difficulty": difficulty,
            })

    return free_models


def _infer_difficulty(context_length: int) -> str:
    if context_length >= 128000:
        return "HARD"
    if context_length >= 32000:
        return "INTERMEDIATE"
    return "SIMPLE"


def detect_difficulty(message: str) -> str:
    """Auto-detect input difficulty: SIMPLE, INTERMEDIATE, or HARD."""
    trimmed = message.strip().lower()
    words = trimmed.split()
    word_count = len(words)

    score = 0

    hard_signals = [
        "architecture", "strategy", "debug", "debugging", "system design",
        "roadmap", "theorem", "philosophy", "research", "multi-step",
        "production", "incident", "optimize", "complex", "synthesize",
        "refactor", "algorithm", "performance", "scalability",
    ]

    intermediate_signals = [
        "build", "write", "compare", "implement", "explain", "analyze",
        "review", "generate", "function", "api", "database", "summarize",
        "translate", "draft", "create", "design", "plan",
    ]

    for signal in hard_signals:
        if signal in trimmed:
            score += 3

    for signal in intermediate_signals:
        if signal in trimmed:
            score += 1.5

    if word_count > 40:
        score += 2.5
    elif word_count > 20:
        score += 1.5
    elif word_count > 10:
        score += 0.5

    if "?" in trimmed:
        score += 0.5

    if score >= 5:
        return "HARD"
    if score >= 2:
        return "INTERMEDIATE"
    return "SIMPLE"


def get_alternative_models(
    failed_model: str,
    free_models: list[dict[str, Any]],
    same_difficulty_only: bool = True,
) -> list[str]:
    """Return alternative model IDs, excluding the one that failed."""
    failed_info = next((m for m in free_models if m["id"] == failed_model), None)
    target_difficulty = failed_info.get("difficulty") if failed_info else None

    candidates: list[tuple[str, int]] = []
    for m in free_models:
        mid = m["id"]
        if mid == failed_model:
            continue
        if same_difficulty_only and target_difficulty and m.get("difficulty") != target_difficulty:
            continue
        candidates.append((mid, m.get("context_length", 0)))

    # Sort by context length (largest first for capability)
    candidates.sort(key=lambda x: x[1], reverse=True)
    return [mid for mid, _ in candidates]


def select_model_for_difficulty(
    difficulty: str,
    free_models: list[dict[str, Any]],
) -> str:
    """Select the best free model for the detected difficulty."""
    tier_models = [m for m in free_models if m.get("difficulty") == difficulty]
    if not tier_models:
        tier_models = free_models
    if not tier_models:
        return ""
    best = max(tier_models, key=lambda m: m.get("context_length", 0))
    return str(best["id"])
