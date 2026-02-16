import React from "react";
import { render, screen } from "@testing-library/react";
import ResultsPanel from "./ResultsPanel";
import { OptimizationResponse } from "../../types";

const mockResult: OptimizationResponse = {
  total_budget: 50000,
  total_cost: 49500,
  total_cases_prevented: 500,
  allocations: [
    {
      region_id: 1,
      region_name: "Dar es Salaam",
      itn_units: 5000,
      irs_units: 100,
      larvicide_units: 200,
      cost: 28100,
      cases_prevented: 280,
    },
  ],
};

describe("ResultsPanel", () => {
  it("shows empty state when no result", () => {
    render(<ResultsPanel result={undefined} />);
    expect(screen.getByText(/Run the optimizer/)).toBeInTheDocument();
  });

  it("renders metric cards with data", () => {
    render(<ResultsPanel result={mockResult} />);
    expect(screen.getByText("$50,000")).toBeInTheDocument();
    expect(screen.getByText("$49,500")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("renders allocation table with accessible label", () => {
    render(<ResultsPanel result={mockResult} />);
    expect(screen.getByRole("table", { name: /Resource allocation/i })).toBeInTheDocument();
    expect(screen.getByText("Dar es Salaam")).toBeInTheDocument();
  });

  it("has region aria-label", () => {
    render(<ResultsPanel result={mockResult} />);
    expect(screen.getByRole("region", { name: /Optimization results/i })).toBeInTheDocument();
  });
});
