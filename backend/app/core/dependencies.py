from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_session

get_db = get_session
