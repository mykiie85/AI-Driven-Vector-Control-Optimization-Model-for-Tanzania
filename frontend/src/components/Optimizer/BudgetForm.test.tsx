import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BudgetForm from "./BudgetForm";
import { RegionProperties } from "../../types";

const mockRegions: RegionProperties[] = [
  { id: 1, name: "Dar es Salaam", population: 5383728, area_km2: 1393, risk_score: 0.82 },
  { id: 2, name: "Dodoma", population: 2604590, area_km2: 41311, risk_score: 0.45 },
];

describe("BudgetForm", () => {
  it("renders with accessible form label", () => {
    render(<BudgetForm regions={mockRegions} onSubmit={jest.fn()} isLoading={false} />);
    expect(screen.getByRole("form", { name: /budget optimization/i })).toBeInTheDocument();
  });

  it("renders budget input with proper label association", () => {
    render(<BudgetForm regions={mockRegions} onSubmit={jest.fn()} isLoading={false} />);
    expect(screen.getByLabelText(/Total Budget/i)).toBeInTheDocument();
  });

  it("renders region checkboxes with aria-labels", () => {
    render(<BudgetForm regions={mockRegions} onSubmit={jest.fn()} isLoading={false} />);
    expect(screen.getByLabelText(/Dar es Salaam/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dodoma/)).toBeInTheDocument();
  });

  it("select all toggles to clear all", () => {
    render(<BudgetForm regions={mockRegions} onSubmit={jest.fn()} isLoading={false} />);
    fireEvent.click(screen.getByText("Select All"));

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => expect(cb).toBeChecked());

    // Now should show "Clear All"
    expect(screen.getByText("Clear All")).toBeInTheDocument();
  });

  it("submits with correct data", () => {
    const onSubmit = jest.fn();
    render(<BudgetForm regions={mockRegions} onSubmit={onSubmit} isLoading={false} />);

    fireEvent.click(screen.getByText("Select All"));
    fireEvent.click(screen.getByText("Run Optimization"));

    expect(onSubmit).toHaveBeenCalledWith({
      budget_usd: 50000,
      region_ids: [1, 2],
    });
  });

  it("shows loading state with aria-busy", () => {
    render(<BudgetForm regions={mockRegions} onSubmit={jest.fn()} isLoading={true} />);
    const btn = screen.getByText("Optimizing...");
    expect(btn.closest("button")).toHaveAttribute("aria-busy", "true");
  });

  it("disables submit when no regions selected", () => {
    render(<BudgetForm regions={mockRegions} onSubmit={jest.fn()} isLoading={false} />);
    expect(screen.getByText("Run Optimization")).toBeDisabled();
  });

  it("shows selected count", () => {
    render(<BudgetForm regions={mockRegions} onSubmit={jest.fn()} isLoading={false} />);
    fireEvent.click(screen.getByText("Select All"));
    expect(screen.getByText("2 of 2 regions selected")).toBeInTheDocument();
  });
});
