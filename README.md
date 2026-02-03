# VCOM-Tz: AI-Driven Vector Control Optimization Model for Tanzania

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![R](https://img.shields.io/badge/R-4.0+-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Executive Summary
**VCOM-Tz** is an end-to-end decision support system designed to modernize malaria surveillance and intervention planning. Bridging the gap between **molecular laboratory data** and **mathematical modelling**, this platform ingests field surveillance data, predicts mosquito population densities using hybrid forecasting (ARIMA/Prophet), and uses Linear Programming to optimize the allocation of vector control resources (ITNs, IRS, Larvicides).

This project demonstrates the technical architecture required to support the **MSMT2** (Molecular Surveillance) and **DM4M** (Modelling) mandates at the Ifakara Health Institute.

## 🚀 Key Features

* **Hybrid Forecasting Engine**: Combines **Python (Prophet)** for seasonal trending and **R (Forecast package)** for statistical ARIMA modeling, ensuring high-accuracy predictions of vector density.
* **Cost-Effectiveness Optimizer**: A Linear Programming module that calculates the optimal mix of interventions to maximize cases prevented within a fixed budget.
* **Geospatial Risk Mapping**: Interactive React + Leaflet frontend visualizing high-risk districts across Tanzania based on real-time surveillance data.
* **Automated Research Reporting**: Uses NLP (HuggingFace Transformers) to auto-generate research abstracts and summaries from model outputs, streamlining the manuscript preparation process.
* **Robust Data Pipeline**: Implements strict data validation and cleaning protocols compliant with data management SOPs.

## 🛠️ Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Backend API** | Python (FastAPI), Uvicorn |
| **Statistical Modeling** | R (forecast, jsonlite), Python (Prophet, Scikit-learn) |
| **Database** | PostgreSQL + PostGIS (Spatial Data) |
| **Frontend** | React.js, Leaflet.js (Mapping), Chart.js |
| **DevOps** | Docker, Docker Compose, GitHub Actions |
| **NLP** | HuggingFace Transformers (Bart-Large-CNN) |

## 🏗️ Architecture

The system follows a microservices-ready architecture:

# VCOM-Tz: AI-Driven Vector Control Optimization Model for Tanzania

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![R](https://img.shields.io/badge/R-4.0+-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Executive Summary
**VCOM-Tz** is an end-to-end decision support system designed to modernize malaria surveillance and intervention planning. Bridging the gap between **molecular laboratory data** and **mathematical modelling**, this platform ingests field surveillance data, predicts mosquito population densities using hybrid forecasting (ARIMA/Prophet), and uses Linear Programming to optimize the allocation of vector control resources (ITNs, IRS, Larvicides).

This project demonstrates the technical architecture required to support the **MSMT2** (Molecular Surveillance) and **DM4M** (Modelling) mandates at the Ifakara Health Institute.

## 🚀 Key Features

* **Hybrid Forecasting Engine**: Combines **Python (Prophet)** for seasonal trending and **R (Forecast package)** for statistical ARIMA modeling, ensuring high-accuracy predictions of vector density.
* **Cost-Effectiveness Optimizer**: A Linear Programming module that calculates the optimal mix of interventions to maximize cases prevented within a fixed budget.
* **Geospatial Risk Mapping**: Interactive React + Leaflet frontend visualizing high-risk districts across Tanzania based on real-time surveillance data.
* **Automated Research Reporting**: Uses NLP (HuggingFace Transformers) to auto-generate research abstracts and summaries from model outputs, streamlining the manuscript preparation process.
* **Robust Data Pipeline**: Implements strict data validation and cleaning protocols compliant with data management SOPs.

## 🛠️ Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Backend API** | Python (FastAPI), Uvicorn |
| **Statistical Modeling** | R (forecast, jsonlite), Python (Prophet, Scikit-learn) |
| **Database** | PostgreSQL + PostGIS (Spatial Data) |
| **Frontend** | React.js, Leaflet.js (Mapping), Chart.js |
| **DevOps** | Docker, Docker Compose, GitHub Actions |
| **NLP** | HuggingFace Transformers (Bart-Large-CNN) |

## 🏗️ Architecture

The system follows a microservices-ready architecture:

1.  **Ingestion Layer**: Validates CSV/Excel uploads from field teams.
2.  **Processing Layer**:
    * *Forecaster Service*: Routes requests to Prophet (Python) or Auto-ARIMA (R script).
    * *Optimizer Service*: Runs `scipy.optimize` linear programming tasks.
3.  **Presentation Layer**: RESTful API serving the React Dashboard.

## ⚡ Getting Started

### Prerequisites
* Docker & Docker Compose (Recommended)
* **OR** Python 3.9+ and R 4.x installed locally.

### Method 1: Docker (Fastest)

```bash
# 1. Clone the repository
git clone [https://github.com/mykiie85/VCOM-Tz.git](https://github.com/mykiie85/VCOM-Tz.git)
cd VCOM-Tz

# 2. Build and Run the Container
docker-compose up --build
The API will be available at http://localhost:8000 and the Dashboard at http://localhost:3000.

Method 2: Manual Local Setup
Backend:

Bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install Python dependencies
pip install -r requirements.txt

# Ensure R dependencies are installed
Rscript -e "install.packages(c('forecast', 'jsonlite'), repos='[http://cran.rstudio.com/](http://cran.rstudio.com/)')"

# Run Server
uvicorn app.main:app --reload
Frontend:

Bash
cd frontend
npm install
npm start
📊 API Usage Examples
1. Generate Mosquito Forecast
GET /forecast/{region_id}

Input: Region ID (e.g., 1 for Bagamoyo) Response:

JSON
[
  {
    "date": "2025-03-01",
    "predicted_density": 145.2,
    "lower_ci": 130.5,
    "upper_ci": 160.1
  },
  ...
]
2. Optimize Budget
POST /optimize

Payload:

JSON
{
  "budget_usd": 50000,
  "regions": ["Kinondoni", "Temeke", "Ilala"]
}
Response:

JSON
{
  "allocation": {
    "Kinondoni": {"ITN_units": 5000, "IRS_units": 0},
    "Temeke": {"ITN_units": 2000, "IRS_units": 1000}
  },
  "total_cases_prevented": 3405
}
🧪 Testing
To ensure reliability and GCLP compliance in code, we run a comprehensive test suite.

Bash
# Run backend tests
cd backend
pytest tests/
📂 Project Structure
VCOM-Tz/
├── backend/
│   ├── app/
│   │   ├── services/       # Logic for Optimization & Forecasting
│   │   ├── r_scripts/      # R integration for ARIMA
│   │   └── api/            # FastAPI Routes
│   ├── tests/              # Pytest modules
│   └── Dockerfile
├── frontend/               # React Application
├── database/               # SQL & PostGIS Schemas
└── notebooks/              # EDA & Model Prototyping
👤 Author
Mike Levison Sanga

Role: Laboratory Scientist & Data Scientist

Expertise: ISO 15189, Machine Learning, Genomics, R/Python

Email: mykiie85@gmail.com

GitHub: mykiie85

LinkedIn: Mike Sanga