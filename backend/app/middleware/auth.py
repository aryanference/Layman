from __future__ import annotations

import logging
from fastapi import Request
from jose import jwt, JWTError
import httpx

from ..config import get_settings

logger = logging.getLogger(__name__)

_jwks_cache: dict | None = None


async def _get_supabase_jwks() -> dict | None:
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    settings = get_settings()
    supabase_url = settings.supabase_url.strip()
    if not supabase_url:
        logger.warning("SUPABASE_URL not configured, cannot fetch JWKS")
        return None

    # Try with service role key first (required for some Supabase projects)
    headers = {}
    if settings.supabase_service_role_key:
        headers["apikey"] = settings.supabase_service_role_key

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{supabase_url}/auth/v1/certs", headers=headers)
            response.raise_for_status()
            _jwks_cache = response.json()
            logger.info("Supabase JWKS fetched successfully")
            return _jwks_cache
    except Exception as e:
        logger.warning(f"Failed to fetch Supabase JWKS: {e}")
        return None


async def get_current_user(request: Request) -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "").strip()
    if not token:
        return None

    settings = get_settings()

    # Strategy 1: Use JWT secret with HS256 (most reliable for Supabase)
    if settings.supabase_jwt_secret:
        try:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False, "verify_iss": False},
            )
            user_id = payload.get("sub")
            if user_id:
                logger.info("Token verified with HS256 (JWT secret)")
                return str(user_id)
        except JWTError:
            pass
        except Exception as e:
            logger.debug(f"HS256 verify failed: {e}")

    # Strategy 2: Use JWKS with RS256
    jwks = await _get_supabase_jwks()
    if jwks:
        try:
            payload = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                audience="authenticated",
                options={"verify_iss": False},
            )
            user_id = payload.get("sub")
            if user_id:
                logger.info("Token verified with RS256 (JWKS)")
                return str(user_id)
        except JWTError:
            pass
        except Exception as e:
            logger.debug(f"RS256 verify failed: {e}")

    # Strategy 3: RS256 without audience
    if jwks:
        try:
            payload = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                options={"verify_aud": False, "verify_iss": False},
            )
            user_id = payload.get("sub")
            if user_id:
                logger.info("Token verified with RS256 (no aud)")
                return str(user_id)
        except JWTError:
            pass
        except Exception as e:
            logger.debug(f"RS256 no-aud verify failed: {e}")

    logger.warning("All token verification attempts failed, treating as guest")
    return None
