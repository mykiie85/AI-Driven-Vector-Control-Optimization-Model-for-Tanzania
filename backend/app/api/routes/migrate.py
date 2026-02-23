import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

# Migrations embedded directly — no filesystem dependency
MIGRATIONS = [
    (
        "001_create_extensions",
        """
        CREATE EXTENSION IF NOT EXISTS postgis;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        """,
    ),
    (
        "002_create_tables",
        """
        CREATE TABLE IF NOT EXISTS regions (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            geometry GEOMETRY(MultiPolygon, 4326),
            population INTEGER,
            area_km2 FLOAT,
            risk_score FLOAT DEFAULT 0.0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_regions_geometry ON regions USING GIST (geometry);
        CREATE INDEX IF NOT EXISTS idx_regions_name ON regions (name);

        CREATE TABLE IF NOT EXISTS surveillance_data (
            id SERIAL PRIMARY KEY,
            region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            mosquito_density FLOAT NOT NULL,
            rainfall_mm FLOAT,
            temperature_c FLOAT,
            humidity_pct FLOAT,
            malaria_cases INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_surveillance_region_date ON surveillance_data (region_id, date);
        CREATE INDEX IF NOT EXISTS idx_surveillance_date ON surveillance_data (date);

        CREATE TABLE IF NOT EXISTS forecasts (
            id SERIAL PRIMARY KEY,
            region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
            model_type VARCHAR(20) NOT NULL DEFAULT 'prophet',
            forecast_date DATE NOT NULL,
            predicted_density FLOAT NOT NULL,
            lower_ci FLOAT,
            upper_ci FLOAT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_forecasts_region ON forecasts (region_id, forecast_date);

        CREATE TABLE IF NOT EXISTS optimization_results (
            id SERIAL PRIMARY KEY,
            region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
            budget_usd FLOAT NOT NULL,
            itn_units INTEGER DEFAULT 0,
            irs_units INTEGER DEFAULT 0,
            larvicide_units INTEGER DEFAULT 0,
            total_cost FLOAT,
            cases_prevented FLOAT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_optimization_region ON optimization_results (region_id);
        """,
    ),
    (
        "003_seed_regions",
        """
        INSERT INTO regions (name, population, area_km2, risk_score, geometry) VALUES
        ('Dar es Salaam', 5383728, 1393, 0.82, ST_GeomFromText('MULTIPOLYGON(((39.1 -6.7, 39.5 -6.7, 39.5 -7.0, 39.1 -7.0, 39.1 -6.7)))', 4326)),
        ('Dodoma', 2604590, 41311, 0.45, ST_GeomFromText('MULTIPOLYGON(((35.5 -5.5, 36.5 -5.5, 36.5 -7.0, 35.5 -7.0, 35.5 -5.5)))', 4326)),
        ('Arusha', 1943196, 37576, 0.30, ST_GeomFromText('MULTIPOLYGON(((35.5 -2.5, 37.0 -2.5, 37.0 -4.0, 35.5 -4.0, 35.5 -2.5)))', 4326)),
        ('Mwanza', 3100578, 35187, 0.65, ST_GeomFromText('MULTIPOLYGON(((31.5 -2.0, 33.5 -2.0, 33.5 -3.5, 31.5 -3.5, 31.5 -2.0)))', 4326)),
        ('Tanga', 2230950, 26808, 0.72, ST_GeomFromText('MULTIPOLYGON(((38.5 -4.5, 39.5 -4.5, 39.5 -6.0, 38.5 -6.0, 38.5 -4.5)))', 4326)),
        ('Morogoro', 3197104, 70799, 0.68, ST_GeomFromText('MULTIPOLYGON(((36.0 -6.0, 38.5 -6.0, 38.5 -8.5, 36.0 -8.5, 36.0 -6.0)))', 4326)),
        ('Mbeya', 2707410, 60350, 0.55, ST_GeomFromText('MULTIPOLYGON(((32.5 -7.5, 34.5 -7.5, 34.5 -9.5, 32.5 -9.5, 32.5 -7.5)))', 4326)),
        ('Iringa', 1192728, 58936, 0.40, ST_GeomFromText('MULTIPOLYGON(((34.0 -7.0, 36.5 -7.0, 36.5 -9.0, 34.0 -9.0, 34.0 -7.0)))', 4326)),
        ('Kilimanjaro', 1855196, 13309, 0.25, ST_GeomFromText('MULTIPOLYGON(((37.0 -2.8, 38.0 -2.8, 38.0 -3.8, 37.0 -3.8, 37.0 -2.8)))', 4326)),
        ('Kagera', 2989299, 28388, 0.70, ST_GeomFromText('MULTIPOLYGON(((30.5 -1.0, 32.0 -1.0, 32.0 -2.5, 30.5 -2.5, 30.5 -1.0)))', 4326)),
        ('Mtwara', 1424085, 16707, 0.75, ST_GeomFromText('MULTIPOLYGON(((39.5 -10.0, 40.5 -10.0, 40.5 -11.0, 39.5 -11.0, 39.5 -10.0)))', 4326)),
        ('Lindi', 1014526, 66046, 0.73, ST_GeomFromText('MULTIPOLYGON(((38.5 -8.5, 40.0 -8.5, 40.0 -10.5, 38.5 -10.5, 38.5 -8.5)))', 4326)),
        ('Tabora', 2658138, 76151, 0.60, ST_GeomFromText('MULTIPOLYGON(((31.5 -4.5, 33.5 -4.5, 33.5 -6.5, 31.5 -6.5, 31.5 -4.5)))', 4326)),
        ('Kigoma', 2470967, 45066, 0.58, ST_GeomFromText('MULTIPOLYGON(((29.5 -3.5, 31.0 -3.5, 31.0 -5.5, 29.5 -5.5, 29.5 -3.5)))', 4326)),
        ('Pwani', 1303569, 32407, 0.78, ST_GeomFromText('MULTIPOLYGON(((38.0 -6.5, 39.5 -6.5, 39.5 -8.0, 38.0 -8.0, 38.0 -6.5)))', 4326)),
        ('Singida', 1660753, 49341, 0.35, ST_GeomFromText('MULTIPOLYGON(((34.0 -4.5, 35.5 -4.5, 35.5 -6.5, 34.0 -6.5, 34.0 -4.5)))', 4326))
        ON CONFLICT (name) DO NOTHING;
        """,
    ),
    (
        "004_seed_surveillance",
        """
        DO $$
        DECLARE
            r RECORD;
            d DATE;
            day_of_year INTEGER;
            seasonal_factor FLOAT;
            base_density FLOAT;
            noise FLOAT;
            density FLOAT;
            rainfall FLOAT;
            temperature FLOAT;
            humidity FLOAT;
            cases INTEGER;
        BEGIN
            -- Skip if data already exists
            IF EXISTS (SELECT 1 FROM surveillance_data LIMIT 1) THEN
                RETURN;
            END IF;

            FOR r IN SELECT id, name, risk_score FROM regions LOOP
                d := '2023-01-01'::DATE;
                WHILE d <= '2024-12-31'::DATE LOOP
                    day_of_year := EXTRACT(DOY FROM d)::INTEGER;
                    seasonal_factor := 0.5 + 0.5 * SIN(2 * PI() * (day_of_year - 60) / 365.0);
                    base_density := 50 + 200 * r.risk_score;
                    noise := 0.85 + 0.30 * RANDOM();
                    density := GREATEST(5.0, base_density * seasonal_factor * noise);
                    rainfall := GREATEST(0, 80 * seasonal_factor + 20 * RANDOM());
                    temperature := 22 + 8 * (0.5 + 0.3 * SIN(2 * PI() * day_of_year / 365.0)) + 2 * (RANDOM() - 0.5);
                    humidity := 50 + 30 * seasonal_factor + 10 * (RANDOM() - 0.5);
                    cases := GREATEST(0, (density * 0.1 * (0.8 + 0.4 * RANDOM()))::INTEGER);

                    INSERT INTO surveillance_data (region_id, date, mosquito_density, rainfall_mm, temperature_c, humidity_pct, malaria_cases)
                    VALUES (r.id, d, ROUND(density::NUMERIC, 2), ROUND(rainfall::NUMERIC, 1), ROUND(temperature::NUMERIC, 1), ROUND(humidity::NUMERIC, 1), cases);

                    d := d + INTERVAL '1 day';
                END LOOP;
            END LOOP;
        END $$;
        """,
    ),
]


@router.post("/migrate")
async def run_migrations(db: AsyncSession = Depends(get_db)):
    """Run database migrations. Safe to call multiple times (idempotent)."""
    results = []

    for name, sql in MIGRATIONS:
        try:
            await db.execute(text(sql))
            await db.commit()
            results.append({"migration": name, "status": "success"})
            logger.info("Migration %s applied successfully", name)
        except Exception as e:
            await db.rollback()
            error_msg = str(e)[:300]
            results.append({"migration": name, "status": "error", "detail": error_msg})
            logger.error("Migration %s failed: %s", name, e)

    applied = sum(1 for r in results if r["status"] == "success")
    return {
        "message": f"{applied}/{len(MIGRATIONS)} migrations applied",
        "results": results,
    }
