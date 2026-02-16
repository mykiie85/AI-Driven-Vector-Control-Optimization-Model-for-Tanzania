FROM python:3.11-slim AS base

# Install system dependencies and R
RUN apt-get update && apt-get install -y --no-install-recommends \
    r-base \
    r-base-dev \
    libpq-dev \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN Rscript -e "install.packages(c('forecast', 'jsonlite'), repos='https://cloud.r-project.org/')"

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
