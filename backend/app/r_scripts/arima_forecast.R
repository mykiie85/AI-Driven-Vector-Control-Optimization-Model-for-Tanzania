#!/usr/bin/env Rscript
# ARIMA Forecasting Script
# Reads JSON from stdin, outputs JSON to stdout
# Input:  {"dates": [...], "values": [...], "horizon": N}
# Output: {"forecasts": [{"date": "YYYY-MM-DD", "forecast": F, "lower": L, "upper": U}, ...]}

suppressPackageStartupMessages({
  library(forecast)
  library(jsonlite)
})

# Read JSON from stdin
input_json <- paste(readLines("stdin", warn = FALSE), collapse = "")
input_data <- fromJSON(input_json)

dates  <- as.Date(input_data$dates)
values <- as.numeric(input_data$values)
horizon <- as.integer(input_data$horizon)

# Create time series (daily frequency ~ 365)
ts_data <- ts(values, frequency = 365, start = c(
  as.numeric(format(dates[1], "%Y")),
  as.numeric(format(dates[1], "%j"))
))

# Fit auto.arima model
model <- auto.arima(ts_data, seasonal = TRUE, stepwise = TRUE, approximation = TRUE)

# Generate forecast
fc <- forecast(model, h = horizon, level = 95)

# Build output dates
last_date <- max(dates)
forecast_dates <- seq.Date(last_date + 1, by = "day", length.out = horizon)

# Build output
output <- data.frame(
  date     = as.character(forecast_dates),
  forecast = as.numeric(fc$mean),
  lower    = as.numeric(fc$lower[, 1]),
  upper    = as.numeric(fc$upper[, 1])
)

# Write JSON to stdout
cat(toJSON(list(forecasts = output), auto_unbox = TRUE))
