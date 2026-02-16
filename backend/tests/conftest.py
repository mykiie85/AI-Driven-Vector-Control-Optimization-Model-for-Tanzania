import asyncio
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import StaticPool, event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app
from app.models.database import Base, get_session


# Use SQLite for tests (no PostGIS needed for unit tests)
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    engine = create_async_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Enable spatialite loading for GeoAlchemy2 compatibility (skip if not available)
    @event.listens_for(engine.sync_engine, "connect")
    def connect(dbapi_conn, connection_record):
        dbapi_conn.execute("SELECT 1")

    async with engine.begin() as conn:
        # Create all tables (without PostGIS-specific columns for SQLite)
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine):
    session_factory = async_sessionmaker(db_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_engine):
    session_factory = async_sessionmaker(db_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seeded_db(db_session):
    """Seed test data into the database."""
    from app.models.region import Region
    from app.models.surveillance import SurveillanceData

    # Add test regions (without geometry for SQLite)
    regions = [
        Region(id=1, name="Dar es Salaam", population=5383728, area_km2=1393, risk_score=0.82),
        Region(id=2, name="Dodoma", population=2604590, area_km2=41311, risk_score=0.45),
        Region(id=3, name="Arusha", population=1943196, area_km2=37576, risk_score=0.30),
    ]
    for r in regions:
        db_session.add(r)
    await db_session.flush()

    # Add surveillance data (90 days for each region)
    base_date = date(2024, 1, 1)
    for region in regions:
        for i in range(90):
            d = base_date + timedelta(days=i)
            density = 50 + region.risk_score * 100 + (i % 30) * 2
            db_session.add(
                SurveillanceData(
                    region_id=region.id,
                    date=d,
                    mosquito_density=round(density, 2),
                    rainfall_mm=round(50 + i * 0.5, 1),
                    temperature_c=round(25 + (i % 10) * 0.3, 1),
                    humidity_pct=round(60 + (i % 15), 1),
                    malaria_cases=int(density * 0.1),
                )
            )
    await db_session.commit()
    return db_session
