from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Float, Integer, String

from app.models.database import Base


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    geometry = Column(Geometry("MULTIPOLYGON", srid=4326))
    population = Column(Integer)
    area_km2 = Column(Float)
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
