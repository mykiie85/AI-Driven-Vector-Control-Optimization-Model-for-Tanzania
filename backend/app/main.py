import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import forecast, health, migrate, optimize, regions, reports
from app.core.config import settings

logging.basicConfig(level=getattr(logging, settings.log_level.upper()))
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("VCOM-TZ API starting up")
    yield
    logger.info("VCOM-TZ API shutting down")


app = FastAPI(
    title="VCOM-TZ API",
    description="AI-Driven Vector Control Optimization Model for Tanzania",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(health.router, tags=["Health"])  # Root /health for Render health checks
app.include_router(regions.router, prefix="/api/v1", tags=["Regions"])
app.include_router(forecast.router, prefix="/api/v1", tags=["Forecast"])
app.include_router(optimize.router, prefix="/api/v1", tags=["Optimization"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(migrate.router, prefix="/api/v1", tags=["Migration"])
