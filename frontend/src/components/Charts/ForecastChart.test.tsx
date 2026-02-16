import React from "react";
import { render, screen } from "@testing-library/react";
import ForecastChart from "./ForecastChart";
import { ForecastResponse } from "../../types";

jest.mock("react-chartjs-2", () => ({
  Line: (props: any) => <div data-testid="line-chart">Chart</div>,
}));

const mockForecast: ForecastResponse = {
  region_id: 1,
  region_name: "Dar es Salaam",
  model_type: "prophet",
  forecast_days: 30,
  points: [
    { date: "2024-07-01", predicted_density: 120.5, lower_ci: 100.0, upper_ci: 140.0 },
    { date: "2024-07-02", predicted_density: 125.0, lower_ci: 105.0, upper_ci: 145.0 },
  ],
};

describe("ForecastChart", () => {
  it("shows loading state with accessible role", () => {
    render(<ForecastChart forecast={undefined} isLoading={true} />);
    expect(screen.getAllByText("Generating forecast...").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows empty state when no forecast", () => {
    render(<ForecastChart forecast={undefined} isLoading={false} />);
    expect(screen.getByText("No forecast data")).toBeInTheDocument();
    expect(screen.getByText(/Select a region/)).toBeInTheDocument();
  });

  it("renders chart when forecast data provided", () => {
    render(<ForecastChart forecast={mockForecast} isLoading={false} />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("has accessible aria-label on chart container", () => {
    render(<ForecastChart forecast={mockForecast} isLoading={false} />);
    expect(screen.getByRole("img", { name: /Forecast chart for Dar es Salaam/ })).toBeInTheDocument();
  });
});
