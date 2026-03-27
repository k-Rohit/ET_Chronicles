"""
Supabase auth dependency for FastAPI.
Verifies the Bearer token by calling Supabase's auth API.
"""

import os
import httpx
from fastapi import HTTPException, Request


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


async def get_current_user(request: Request) -> dict:
    """
    FastAPI dependency that verifies the Supabase JWT by calling
    Supabase's auth.getUser() endpoint. Returns the user object.
    """
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid authorization header")

    token = auth_header[7:]

    if not SUPABASE_URL:
        raise HTTPException(500, "Server auth not configured (missing SUPABASE_URL)")

    # Verify token by calling Supabase auth API
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_ANON_KEY,
                },
            )
            if resp.status_code != 200:
                raise HTTPException(401, "Invalid or expired token")
            return resp.json()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Token verification failed")
