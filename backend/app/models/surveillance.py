from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer

from app.models.database import Base


class SurveillanceData(Base):
    __tablename__ = "surveillance_data"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    mosquito_density = Column(Float, nullable=False)
    rainfall_mm = Column(Float)
    temperature_c = Column(Float)
    humidity_pct = Column(Float)
    malaria_cases = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
