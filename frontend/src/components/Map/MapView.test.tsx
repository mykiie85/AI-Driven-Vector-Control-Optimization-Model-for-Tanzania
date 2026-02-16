import React from "react";
import { render, screen } from "@testing-library/react";
import MapView from "./MapView";
import { RegionGeoJSON } from "../../types";

// Mock react-leaflet
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: ({ data, style, onEachFeature }: any) => (
    <div data-testid="geojson-layer" data-features={data?.features?.length ?? 0} />
  ),
}));

jest.mock("leaflet/dist/leaflet.css", () => ({}));

const mockData: RegionGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "MultiPolygon", coordinates: [] },
      properties: {
        id: 1,
        name: "Dar es Salaam",
        population: 5000000,
        area_km2: 1393,
        risk_score: 0.75,
      },
    },
    {
      type: "Feature",
      geometry: { type: "MultiPolygon", coordinates: [] },
      properties: {
        id: 2,
        name: "Mwanza",
        population: 3000000,
        area_km2: 9467,
        risk_score: 0.45,
      },
    },
  ],
};

const emptyData: RegionGeoJSON = { type: "FeatureCollection", features: [] };

describe("MapView", () => {
  it("renders map container with accessible label", () => {
    render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
    expect(
      screen.getByRole("region", { name: /interactive map of tanzania/i })
    ).toBeInTheDocument();
  });

  it("renders MapContainer and TileLayer", () => {
    render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
  });

  it("renders GeoJSON layer when features exist", () => {
    render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
    expect(screen.getByTestId("geojson-layer")).toBeInTheDocument();
  });

  it("does not render GeoJSON when features array is empty", () => {
    render(<MapView data={emptyData} onSelectRegion={jest.fn()} />);
    expect(screen.queryByTestId("geojson-layer")).not.toBeInTheDocument();
  });

  it("renders Legend component", () => {
    render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
    expect(screen.getByText("Risk Score")).toBeInTheDocument();
  });

  it("sets window.__selectRegion on mount", () => {
    const mockSelect = jest.fn();
    render(<MapView data={mockData} onSelectRegion={mockSelect} />);
    expect((window as any).__selectRegion).toBe(mockSelect);
  });

  it("cleans up window.__selectRegion on unmount", () => {
    const { unmount } = render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
    unmount();
    expect((window as any).__selectRegion).toBeUndefined();
  });
});
