import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "./Dashboard";

// Mock hooks
let mockRegionsData: any = {
  data: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "MultiPolygon", coordinates: [] },
        properties: { id: 1, name: "Dar es Salaam", population: 5000000, area_km2: 1393, risk_score: 0.75 },
      },
    ],
  },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

let mockForecastData: any = { data: undefined, isLoading: false };
let mockOptimizerData: any = { mutate: jest.fn(), isPending: false, data: undefined };

jest.mock("../../hooks/useRegions", () => ({
  useRegions: () => mockRegionsData,
}));

jest.mock("../../hooks/useForecast", () => ({
  useForecast: () => mockForecastData,
}));

jest.mock("../../hooks/useOptimizer", () => ({
  useOptimizer: () => mockOptimizerData,
}));

jest.mock("../../hooks/useReport", () => ({
  useReport: () => ({ mutate: jest.fn(), data: undefined, isPending: false, error: null }),
}));

// Mock child components
jest.mock("../Map/MapView", () => (props: any) => (
  <div data-testid="map-view">MapView</div>
));

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div />,
  GeoJSON: () => <div />,
}));

jest.mock("leaflet/dist/leaflet.css", () => ({}));

describe("Dashboard", () => {
  const defaultProps = { sidebarOpen: false, onCloseSidebar: jest.fn() };

  beforeEach(() => {
    mockRegionsData = {
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "MultiPolygon", coordinates: [] },
            properties: { id: 1, name: "Dar es Salaam", population: 5000000, area_km2: 1393, risk_score: 0.75 },
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    };
    mockForecastData = { data: undefined, isLoading: false };
    mockOptimizerData = { mutate: jest.fn(), isPending: false, data: undefined };
  });

  it("shows loading spinner when regions are loading", () => {
    mockRegionsData = { data: undefined, isLoading: true, error: null, refetch: jest.fn() };
    render(<Dashboard {...defaultProps} />);
    expect(screen.getAllByText("Loading regions...").length).toBeGreaterThanOrEqual(1);
  });

  it("shows error alert when regions fail to load", () => {
    mockRegionsData = { data: undefined, isLoading: false, error: new Error("fail"), refetch: jest.fn() };
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Failed to load region data/)).toBeInTheDocument();
  });

  it("renders main content when data is loaded", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByRole("main", { name: /dashboard content/i })).toBeInTheDocument();
  });

  it("renders forecast model tabs", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByRole("tablist", { name: /forecast model/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /prophet/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /arima/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /hybrid/i })).toBeInTheDocument();
  });

  it("has prophet tab selected by default", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByRole("tab", { name: /prophet/i })).toHaveAttribute("aria-selected", "true");
  });

  it("switches model type on tab click", () => {
    render(<Dashboard {...defaultProps} />);
    fireEvent.click(screen.getByRole("tab", { name: /arima/i }));
    expect(screen.getByRole("tab", { name: /arima/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /prophet/i })).toHaveAttribute("aria-selected", "false");
  });

  it("renders map section", () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
  });

  it("returns null when no data and not loading", () => {
    mockRegionsData = { data: undefined, isLoading: false, error: null, refetch: jest.fn() };
    const { container } = render(<Dashboard {...defaultProps} />);
    expect(container.innerHTML).toBe("");
  });
});
