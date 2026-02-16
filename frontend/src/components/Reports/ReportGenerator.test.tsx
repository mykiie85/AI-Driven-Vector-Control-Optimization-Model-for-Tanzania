import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportGenerator from "./ReportGenerator";

// Configurable mock state
let mockReturnValue: any = {
  mutate: jest.fn(),
  data: undefined,
  isPending: false,
  error: null,
};

jest.mock("../../hooks/useReport", () => ({
  useReport: () => mockReturnValue,
}));

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("ReportGenerator", () => {
  beforeEach(() => {
    mockReturnValue = {
      mutate: jest.fn(),
      data: undefined,
      isPending: false,
      error: null,
    };
  });

  it("renders report generator with accessible label", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[1]} />);
    expect(screen.getByRole("region", { name: /report generator/i })).toBeInTheDocument();
  });

  it("renders title", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[1]} />);
    expect(screen.getByText("NLP Report Generator")).toBeInTheDocument();
  });

  it("renders both option checkboxes checked by default", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[1]} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
  });

  it("shows hint when no regions selected", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[]} />);
    expect(screen.getByText(/Select a region first/)).toBeInTheDocument();
  });

  it("disables generate button when no regions selected", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[]} />);
    expect(screen.getByText("Generate Report")).toBeDisabled();
  });

  it("enables generate button when regions are selected", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[1, 2]} />);
    expect(screen.getByText("Generate Report")).not.toBeDisabled();
  });

  it("calls mutate with correct params on generate", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[1, 3]} />);
    fireEvent.click(screen.getByText("Generate Report"));

    expect(mockReturnValue.mutate).toHaveBeenCalledWith({
      region_ids: [1, 3],
      include_forecast: true,
      include_optimization: true,
    });
  });

  it("toggles forecast checkbox", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[1]} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    fireEvent.click(screen.getByText("Generate Report"));
    expect(mockReturnValue.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ include_forecast: false, include_optimization: true })
    );
  });

  it("has fieldset with sr-only legend for accessibility", () => {
    renderWithQuery(<ReportGenerator selectedRegionIds={[1]} />);
    const legends = document.querySelectorAll("legend");
    expect(legends.length).toBe(1);
  });
});

describe("ReportGenerator - with results", () => {
  it("renders AI summary when data is available", () => {
    mockReturnValue = {
      mutate: jest.fn(),
      data: {
        summary: "Malaria surveillance shows increased density in coastal regions.",
        regions_analyzed: 2,
        model_used: "facebook/bart-large-cnn",
      },
      isPending: false,
      error: null,
    };

    renderWithQuery(<ReportGenerator selectedRegionIds={[1, 2]} />);

    expect(screen.getByText("AI-Generated Summary")).toBeInTheDocument();
    expect(screen.getByText(/increased density in coastal/)).toBeInTheDocument();
    expect(screen.getByText(/2 region\(s\) analyzed/)).toBeInTheDocument();
  });
});
