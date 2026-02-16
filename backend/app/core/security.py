from fastapi import Header, HTTPException, status

from app.core.config import settings


async def verify_api_key(x_api_key: str = Header(default=None)) -> str:
    if settings.api_key == "change-me-to-a-secure-key":
        return "dev-mode"
    if x_api_key is None or x_api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return x_api_key
