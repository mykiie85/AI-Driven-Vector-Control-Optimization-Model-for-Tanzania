import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./Sidebar";
import { RegionProperties } from "../../types";

const mockRegions: RegionProperties[] = [
  { id: 1, name: "Dar es Salaam", population: 5383728, area_km2: 1393, risk_score: 0.82 },
  { id: 2, name: "Dodoma", population: 2604590, area_km2: 41311, risk_score: 0.45 },
  { id: 3, name: "Arusha", population: 1943196, area_km2: 37576, risk_score: 0.15 },
];

describe("Sidebar", () => {
  const defaultProps = {
    regions: mockRegions,
    selectedRegionId: null as number | null,
    onSelectRegion: jest.fn(),
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders region navigation with aria-label", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("navigation", { name: /region/i })).toBeInTheDocument();
  });

  it("renders all regions in list", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText("Dar es Salaam")).toBeInTheDocument();
    expect(screen.getByText("Dodoma")).toBeInTheDocument();
    expect(screen.getByText("Arusha")).toBeInTheDocument();
  });

  it("shows region count", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText("3 regions available")).toBeInTheDocument();
  });

  it("displays risk labels correctly", () => {
    render(<Sidebar {...defaultProps} />);
    // Dar es Salaam: 0.82 -> Critical (82%)
    expect(screen.getByText(/Critical \(82%\)/)).toBeInTheDocument();
    // Dodoma: 0.45 -> Medium (45%)
    expect(screen.getByText(/Medium \(45%\)/)).toBeInTheDocument();
    // Arusha: 0.15 -> Low (15%)
    expect(screen.getByText(/Low \(15%\)/)).toBeInTheDocument();
  });

  it("calls onSelectRegion and onClose when region is clicked", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(<Sidebar {...defaultProps} onSelectRegion={onSelect} onClose={onClose} />);

    fireEvent.click(screen.getByText("Dodoma"));
    expect(onSelect).toHaveBeenCalledWith(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("marks selected region with aria-selected=true", () => {
    render(<Sidebar {...defaultProps} selectedRegionId={1} />);
    const selected = screen.getByRole("option", { selected: true });
    expect(selected).toHaveTextContent("Dar es Salaam");
  });

  it("has listbox role on region list", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("listbox", { name: /select a region/i })).toBeInTheDocument();
  });

  it("shows overlay when open (mobile)", () => {
    const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
    // Overlay should be visible
    const overlays = container.querySelectorAll("[class*=overlayVisible]");
    expect(overlays.length).toBe(1);
  });

  it("calls onClose when overlay is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(<Sidebar {...defaultProps} isOpen={true} onClose={onClose} />);
    const overlay = container.querySelector("[class*=overlayVisible]");
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
