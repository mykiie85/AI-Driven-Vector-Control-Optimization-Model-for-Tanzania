
# VCOM-TZ: AI-Driven Vector Control Optimization Model for Tanzania

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![R](https://img.shields.io/badge/R-4.0+-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

**VCOM-TZ** is an end-to-end decision support system for malaria surveillance and intervention planning in Tanzania. It ingests field surveillance data, predicts mosquito population densities using hybrid forecasting (ARIMA + Prophet), and uses Linear Programming to optimize the allocation of vector control resources (ITNs, IRS, Larvicides).

## Key Features

- **Hybrid Forecasting Engine** - Combines Python (Prophet) and R (ARIMA) for high-accuracy density predictions
- **Cost-Effectiveness Optimizer** - Linear Programming maximizes cases prevented within budget constraints
- **Geospatial Risk Mapping** - Interactive Leaflet choropleth map of Tanzania's 16 regions
- **Automated NLP Reporting** - HuggingFace BART model generates surveillance summaries
- **Robust Data Pipeline** - PostgreSQL + PostGIS with 2 years of synthetic surveillance data

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| Backend API | FastAPI, Uvicorn, Python 3.11 |
| Statistical Modeling | R (forecast, auto.arima), Prophet, SciPy |
| Database | PostgreSQL 15 + PostGIS 3.3 |
| Frontend | React 18, TypeScript, Leaflet, Chart.js |
| DevOps | Docker, Docker Compose |
| NLP | HuggingFace Transformers (bart-large-cnn) |

## Architecture

```
VCOM-TZ/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/routes/   # REST endpoints
│   │   ├── services/     # Business logic (forecast, optimizer, NLP)
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response models
│   │   ├── core/         # Configuration, security, dependencies
│   │   └── r_scripts/    # R ARIMA integration
│   └── tests/            # Pytest suite
├── frontend/             # React TypeScript dashboard
│   └── src/
│       ├── components/   # Map, Charts, Optimizer, Reports, Layout
│       ├── hooks/        # React Query hooks
│       ├── services/     # API client layer
│       └── types/        # TypeScript interfaces
├── database/             # PostgreSQL schema & seed data
│   └── migrations/       # SQL migrations (auto-run on first start)
├── docker-compose.yml    # 3-service orchestration
└── .env.example          # Environment variable template
```

## Quick Start

### Prerequisites

- Docker & Docker Compose **OR**
- Python 3.11+, R 4.x, Node.js 18+, PostgreSQL 15 with PostGIS

### Method 1: Docker (Recommended)

```bash
# Clone and enter the project
git clone https://github.com/mykiie85/VCOM-Tz.git
cd VCOM-Tz

# Copy environment config
cp .env.example .env

# Build and start all services
docker-compose up --build
```

Services will be available at:
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/api/v1/docs
- **API Docs (ReDoc)**: http://localhost:8000/api/v1/redoc
- **Database**: localhost:5432

### Method 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Ensure R packages are installed
Rscript -e "install.packages(c('forecast', 'jsonlite'), repos='https://cloud.r-project.org/')"

# Set environment variables
export DATABASE_URL=postgresql+asyncpg://vcom:vcom_secret_change_me@localhost:5432/vcom_tz

uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check with DB status |
| GET | `/api/v1/regions` | GeoJSON FeatureCollection of all regions |
| GET | `/api/v1/regions/{id}` | Single region details with latest data |
| GET | `/api/v1/forecast/{region_id}` | Generate forecast (prophet/arima/hybrid) |
| POST | `/api/v1/optimize` | Budget optimization across regions |
| POST | `/api/v1/report/generate` | NLP-generated surveillance summary |

### Example: Generate Forecast

```bash
curl http://localhost:8000/api/v1/forecast/1?days=30&model=prophet
```

Response:
```json
{
  "region_id": 1,
  "region_name": "Dar es Salaam",
  "model_type": "prophet",
  "forecast_days": 30,
  "points": [
    {"date": "2025-01-01", "predicted_density": 145.2, "lower_ci": 130.5, "upper_ci": 160.1}
  ]
}
```

### Example: Optimize Budget

```bash
curl -X POST http://localhost:8000/api/v1/optimize \
  -H "Content-Type: application/json" \
  -d '{"budget_usd": 50000, "region_ids": [1, 2, 3]}'
```

## Testing

### Backend (pytest)

```bash
cd backend
pip install -r requirements.txt
pytest tests/ --cov=app --cov-report=term-missing
```

### Frontend (Jest)

```bash
cd frontend
npm install
npm test -- --coverage
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `vcom` |
| `POSTGRES_PASSWORD` | Database password | `vcom_secret_change_me` |
| `POSTGRES_DB` | Database name | `vcom_tz` |
| `DATABASE_URL` | Full async connection string | (composed) |
| `API_KEY` | API key for auth (dev mode if default) | `change-me-to-a-secure-key` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `R_TIMEOUT` | R subprocess timeout (seconds) | `300` |
| `NLP_MODEL` | HuggingFace model name | `facebook/bart-large-cnn` |

## Seed Data

The database is pre-loaded with:
- **16 Tanzania regions** with simplified PostGIS polygon geometries
- **2 years** of daily synthetic surveillance data (2023-2024) with:
  - Seasonal mosquito density patterns (peak during rainy seasons)
  - Correlated environmental variables (rainfall, temperature, humidity)
  - Malaria case counts proportional to vector density

## Author

**Mike Levison Sanga**
- Role: Laboratory Scientist & Data Scientist
- Expertise: ISO 15189, Machine Learning, Genomics, R/Python
- Email: mykiie85@gmail.com
- GitHub: mykiie85
