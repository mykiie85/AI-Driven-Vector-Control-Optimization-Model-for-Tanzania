import React from "react";
import { render, screen } from "@testing-library/react";
import Legend from "./Legend";

describe("Legend", () => {
  it("renders risk score title", () => {
    render(<Legend />);
    expect(screen.getByText("Risk Score")).toBeInTheDocument();
  });

  it("renders all 4 risk levels", () => {
    render(<Legend />);
    expect(screen.getByText("Low (0-30%)")).toBeInTheDocument();
    expect(screen.getByText("Medium (30-60%)")).toBeInTheDocument();
    expect(screen.getByText("High (60-80%)")).toBeInTheDocument();
    expect(screen.getByText("Critical (80%+)")).toBeInTheDocument();
  });

  it("has accessible aria-label describing the legend", () => {
    render(<Legend />);
    const legend = screen.getByRole("img");
    expect(legend).toHaveAttribute("aria-label", expect.stringContaining("Risk score legend"));
  });

  it("renders 4 color swatches", () => {
    const { container } = render(<Legend />);
    const swatches = container.querySelectorAll("[class*=swatch]");
    expect(swatches.length).toBe(4);
  });
});
