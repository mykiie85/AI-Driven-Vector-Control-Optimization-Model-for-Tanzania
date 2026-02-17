import React from "react";
import { render, screen } from "@testing-library/react";
import MapView from "./MapView";
import { RegionGeoJSON } from "../../types";

// Capture callbacks from GeoJSON for testing
let capturedStyle: any = null;
let capturedOnEachFeature: any = null;

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children, className, center, zoom, scrollWheelZoom, ...rest }: any) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: ({ data, style, onEachFeature }: any) => {
    capturedStyle = style;
    capturedOnEachFeature = onEachFeature;
    return <div data-testid="geojson-layer" data-features={data?.features?.length ?? 0} />;
  },
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
  beforeEach(() => {
    capturedStyle = null;
    capturedOnEachFeature = null;
  });

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

  describe("style callback", () => {
    it("returns correct style for high risk region", () => {
      render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
      expect(capturedStyle).toBeDefined();
      const result = capturedStyle({ properties: { risk_score: 0.75 } });
      expect(result.fillColor).toBe("#f44336");
      expect(result.weight).toBe(2);
      expect(result.fillOpacity).toBe(0.65);
    });

    it("returns correct style for critical risk (>=0.8)", () => {
      render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
      const result = capturedStyle({ properties: { risk_score: 0.9 } });
      expect(result.fillColor).toBe("#b71c1c");
    });

    it("returns correct style for medium risk (>=0.3)", () => {
      render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
      const result = capturedStyle({ properties: { risk_score: 0.45 } });
      expect(result.fillColor).toBe("#ff9800");
    });

    it("returns correct style for low risk (<0.3)", () => {
      render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
      const result = capturedStyle({ properties: { risk_score: 0.1 } });
      expect(result.fillColor).toBe("#4caf50");
    });

    it("handles missing risk_score", () => {
      render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
      const result = capturedStyle({ properties: {} });
      expect(result.fillColor).toBe("#4caf50");
    });
  });

  describe("onEachFeature callback", () => {
    it("binds popup and click handler to layer", () => {
      const onSelectRegion = jest.fn();
      render(<MapView data={mockData} onSelectRegion={onSelectRegion} />);
      expect(capturedOnEachFeature).toBeDefined();

      const mockLayer = {
        bindPopup: jest.fn(),
        on: jest.fn(),
      };

      capturedOnEachFeature(mockData.features[0], mockLayer);

      expect(mockLayer.bindPopup).toHaveBeenCalledTimes(1);
      expect(mockLayer.bindPopup).toHaveBeenCalledWith(expect.stringContaining("Dar es Salaam"));
      expect(mockLayer.on).toHaveBeenCalledWith({ click: expect.any(Function) });
    });

    it("click handler calls onSelectRegion with region id", () => {
      const onSelectRegion = jest.fn();
      render(<MapView data={mockData} onSelectRegion={onSelectRegion} />);

      const mockLayer = { bindPopup: jest.fn(), on: jest.fn() };
      capturedOnEachFeature(mockData.features[0], mockLayer);

      // Extract and invoke the click handler
      const clickHandler = mockLayer.on.mock.calls[0][0].click;
      clickHandler();
      expect(onSelectRegion).toHaveBeenCalledWith(1);
    });

    it("popup includes population and area", () => {
      render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
      const mockLayer = { bindPopup: jest.fn(), on: jest.fn() };
      capturedOnEachFeature(mockData.features[0], mockLayer);

      const popupHtml = mockLayer.bindPopup.mock.calls[0][0];
      expect(popupHtml).toContain("5,000,000");
      expect(popupHtml).toContain("1,393");
    });

    it("popup shows correct risk label", () => {
      render(<MapView data={mockData} onSelectRegion={jest.fn()} />);
      const mockLayer = { bindPopup: jest.fn(), on: jest.fn() };
      capturedOnEachFeature(mockData.features[0], mockLayer);

      const popupHtml = mockLayer.bindPopup.mock.calls[0][0];
      expect(popupHtml).toContain("High");
      expect(popupHtml).toContain("75%");
    });
  });
});
