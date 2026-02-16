-- 003: Seed 16 Tanzania regions with simplified PostGIS polygons

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
