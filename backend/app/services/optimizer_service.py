import logging

import numpy as np
from scipy.optimize import linprog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.region import Region
from app.models.surveillance import SurveillanceData
from app.schemas.optimize import (
    OptimizationRequest,
    OptimizationResponse,
    RegionAllocation,
)

logger = logging.getLogger(__name__)

# Intervention parameters
COST_PER_ITN = 5.0
COST_PER_IRS = 15.0
COST_PER_LARVICIDE = 8.0

CASES_PREVENTED_PER_ITN = 0.05
CASES_PREVENTED_PER_IRS = 0.15
CASES_PREVENTED_PER_LARVICIDE = 0.08


class OptimizerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_region_weights(self, region_ids: list[int]) -> dict[int, float]:
        query = (
            select(
                SurveillanceData.region_id,
                func.avg(SurveillanceData.mosquito_density).label("avg_density"),
            )
            .where(SurveillanceData.region_id.in_(region_ids))
            .group_by(SurveillanceData.region_id)
        )
        result = await self.db.execute(query)
        rows = result.all()

        total = sum(row.avg_density for row in rows) or 1.0
        return {row.region_id: row.avg_density / total for row in rows}

    async def optimize(self, request: OptimizationRequest) -> OptimizationResponse:
        # Get region names
        name_query = select(Region.id, Region.name).where(Region.id.in_(request.region_ids))
        name_result = await self.db.execute(name_query)
        names = {row.id: row.name for row in name_result.all()}

        if not names:
            raise ValueError("No valid regions found")

        # Get density-based weights for budget allocation
        weights = await self._get_region_weights(request.region_ids)

        allocations = []
        total_cost = 0.0
        total_prevented = 0.0

        for region_id in request.region_ids:
            if region_id not in names:
                continue

            region_budget = request.budget_usd * weights.get(region_id, 1.0 / len(request.region_ids))

            # Linear programming: maximize cases prevented
            # Variables: [itn_units, irs_units, larvicide_units]
            # Objective: minimize negative cases_prevented (to maximize)
            c = [
                -CASES_PREVENTED_PER_ITN,
                -CASES_PREVENTED_PER_IRS,
                -CASES_PREVENTED_PER_LARVICIDE,
            ]

            # Budget constraint: cost <= region_budget
            A_ub = [[COST_PER_ITN, COST_PER_IRS, COST_PER_LARVICIDE]]
            b_ub = [region_budget]

            # Non-negative bounds
            bounds = [(0, None), (0, None), (0, None)]

            result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

            if result.success:
                itn = int(result.x[0])
                irs = int(result.x[1])
                larvicide = int(result.x[2])
            else:
                # Fallback: allocate all to ITNs (most cost-effective per unit cost)
                itn = int(region_budget / COST_PER_ITN)
                irs = 0
                larvicide = 0

            cost = itn * COST_PER_ITN + irs * COST_PER_IRS + larvicide * COST_PER_LARVICIDE
            prevented = (
                itn * CASES_PREVENTED_PER_ITN
                + irs * CASES_PREVENTED_PER_IRS
                + larvicide * CASES_PREVENTED_PER_LARVICIDE
            )

            allocations.append(
                RegionAllocation(
                    region_id=region_id,
                    region_name=names[region_id],
                    itn_units=itn,
                    irs_units=irs,
                    larvicide_units=larvicide,
                    cost=round(cost, 2),
                    cases_prevented=round(prevented, 2),
                )
            )
            total_cost += cost
            total_prevented += prevented

        return OptimizationResponse(
            total_budget=request.budget_usd,
            total_cost=round(total_cost, 2),
            total_cases_prevented=round(total_prevented, 2),
            allocations=allocations,
        )
