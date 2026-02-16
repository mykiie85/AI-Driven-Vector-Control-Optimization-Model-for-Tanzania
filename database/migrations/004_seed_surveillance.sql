-- 004: Seed 2 years of synthetic surveillance data with seasonal patterns
-- Generates daily data from 2023-01-01 to 2024-12-31 for all 16 regions

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
    FOR r IN SELECT id, name, risk_score FROM regions LOOP
        d := '2023-01-01'::DATE;
        WHILE d <= '2024-12-31'::DATE LOOP
            day_of_year := EXTRACT(DOY FROM d)::INTEGER;

            -- Seasonal pattern: peak during rainy season (March-May, Oct-Dec)
            seasonal_factor := 0.5 + 0.5 * SIN(2 * PI() * (day_of_year - 60) / 365.0);

            -- Base density scaled by region risk score
            base_density := 50 + 200 * r.risk_score;

            -- Add random noise (-15% to +15%)
            noise := 0.85 + 0.30 * RANDOM();

            density := GREATEST(5.0, base_density * seasonal_factor * noise);

            -- Correlated environmental variables
            rainfall := GREATEST(0, 80 * seasonal_factor + 20 * RANDOM());
            temperature := 22 + 8 * (0.5 + 0.3 * SIN(2 * PI() * day_of_year / 365.0)) + 2 * (RANDOM() - 0.5);
            humidity := 50 + 30 * seasonal_factor + 10 * (RANDOM() - 0.5);

            -- Malaria cases correlated with density (lagged effect approximated)
            cases := GREATEST(0, (density * 0.1 * (0.8 + 0.4 * RANDOM()))::INTEGER);

            INSERT INTO surveillance_data (region_id, date, mosquito_density, rainfall_mm, temperature_c, humidity_pct, malaria_cases)
            VALUES (r.id, d, ROUND(density::NUMERIC, 2), ROUND(rainfall::NUMERIC, 1), ROUND(temperature::NUMERIC, 1), ROUND(humidity::NUMERIC, 1), cases);

            d := d + INTERVAL '1 day';
        END LOOP;
    END LOOP;
END $$;
