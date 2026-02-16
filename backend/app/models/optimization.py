from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer

from app.models.database import Base


class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)
    budget_usd = Column(Float, nullable=False)
    itn_units = Column(Integer, default=0)
    irs_units = Column(Integer, default=0)
    larvicide_units = Column(Integer, default=0)
    total_cost = Column(Float)
    cases_prevented = Column(Float)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
