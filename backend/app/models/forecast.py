from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String

from app.models.database import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)
    model_type = Column(String(20), nullable=False, default="prophet")
    forecast_date = Column(Date, nullable=False)
    predicted_density = Column(Float, nullable=False)
    lower_ci = Column(Float)
    upper_ci = Column(Float)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
