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

# Intervention parameters (based on WHO cost-effectiveness estimates)
COST_PER_ITN = 5.0           # USD per insecticide-treated net
COST_PER_IRS = 15.0          # USD per indoor residual spray unit
COST_PER_LARVICIDE = 8.0     # USD per larvicide treatment unit

# Cases prevented per unit (different efficiencies drive diverse allocation)
CASES_PREVENTED_PER_ITN = 0.12        # ITN: community-level protection
CASES_PREVENTED_PER_IRS = 0.45        # IRS: most effective per unit
CASES_PREVENTED_PER_LARVICIDE = 0.20  # Larvicide: targeted breeding sites

# WHO integrated vector management: ensure diversified intervention portfolio
# Each intervention must receive at least 20% and at most 45% of the budget
MIN_ALLOCATION_PCT = 0.20
MAX_ALLOCATION_PCT = 0.45


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

            # Diversified allocation bounds (WHO integrated vector management)
            min_itn = MIN_ALLOCATION_PCT * region_budget / COST_PER_ITN
            max_itn = MAX_ALLOCATION_PCT * region_budget / COST_PER_ITN
            min_irs = MIN_ALLOCATION_PCT * region_budget / COST_PER_IRS
            max_irs = MAX_ALLOCATION_PCT * region_budget / COST_PER_IRS
            min_larv = MIN_ALLOCATION_PCT * region_budget / COST_PER_LARVICIDE
            max_larv = MAX_ALLOCATION_PCT * region_budget / COST_PER_LARVICIDE

            bounds = [
                (min_itn, max_itn),
                (min_irs, max_irs),
                (min_larv, max_larv),
            ]

            result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

            if result.success:
                itn = int(result.x[0])
                irs = int(result.x[1])
                larvicide = int(result.x[2])
            else:
                # Fallback: proportional allocation based on efficiency
                eff_itn = CASES_PREVENTED_PER_ITN / COST_PER_ITN
                eff_irs = CASES_PREVENTED_PER_IRS / COST_PER_IRS
                eff_larv = CASES_PREVENTED_PER_LARVICIDE / COST_PER_LARVICIDE
                total_eff = eff_itn + eff_irs + eff_larv

                itn = int((eff_itn / total_eff) * region_budget / COST_PER_ITN)
                irs = int((eff_irs / total_eff) * region_budget / COST_PER_IRS)
                larvicide = int((eff_larv / total_eff) * region_budget / COST_PER_LARVICIDE)

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
