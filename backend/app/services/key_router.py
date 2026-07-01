from __future__ import annotations

import hashlib
import os

from supabase import create_client

_supabase_client = None


def _get_supabase_client():
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if url and key:
            _supabase_client = create_client(url, key)
    return _supabase_client


GUEST_LIMIT = 20


def _get_provider_env_key(provider: str) -> str:
    """Map provider ID to environment variable key."""
    provider_map = {
        "openrouter": "OPENROUTER_API_KEY",
        "opencode_go": "OPENCODE_GO_API_KEY",
        "opencode_zen": "OPENCODE_ZEN_API_KEY",
    }
    return provider_map.get(provider, "OPENROUTER_API_KEY")


def _get_fallback_key(provider: str) -> str:
    """Get fallback API key for a provider from env."""
    env_key = _get_provider_env_key(provider)
    return os.getenv(env_key, "")


async def get_api_key(user_id: str | None, provider: str, request_ip: str) -> str:
    client = _get_supabase_client()

    if user_id is None:
        ip_hash = hashlib.sha256(request_ip.encode()).hexdigest()
        if client is not None:
            result = client.table("guest_requests").select("id", count="exact").eq("ip_hash", ip_hash).execute()
            if result.count >= GUEST_LIMIT:
                raise PermissionError("guest_limit_reached")
            client.table("guest_requests").insert({"ip_hash": ip_hash}).execute()
        return _get_fallback_key(provider)

    if client is None:
        return _get_fallback_key(provider)

    result = client.table("user_api_keys").select("*").eq("user_id", user_id).maybe_single().execute()
    keys = result.data or {}
    user_key = keys.get(f"{provider}_key") or keys.get("openrouter_key")
    return user_key or _get_fallback_key(provider)