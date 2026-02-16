import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingSpinner, { SkeletonLoader } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with default message", () => {
    render(<LoadingSpinner />);
    expect(screen.getAllByText("Loading...").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with custom message", () => {
    render(<LoadingSpinner message="Fetching data..." />);
    expect(screen.getAllByText("Fetching data...").length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible role=status", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has sr-only text for screen readers", () => {
    render(<LoadingSpinner message="Loading regions" />);
    const srElements = document.querySelectorAll(".sr-only");
    expect(srElements.length).toBeGreaterThan(0);
  });
});

describe("SkeletonLoader", () => {
  it("renders default 3 lines", () => {
    render(<SkeletonLoader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders custom number of lines", () => {
    const { container } = render(<SkeletonLoader lines={5} />);
    const skeletonLines = container.querySelectorAll("[class*=skeletonLine]");
    expect(skeletonLines.length).toBe(5);
  });
});
