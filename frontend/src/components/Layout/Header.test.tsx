import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";

describe("Header", () => {
  const onToggle = jest.fn();

  beforeEach(() => {
    onToggle.mockClear();
  });

  it("renders app title", () => {
    render(<Header onToggleSidebar={onToggle} />);
    expect(screen.getByText("VCOM-TZ")).toBeInTheDocument();
  });

  it("renders banner role", () => {
    render(<Header onToggleSidebar={onToggle} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("has hamburger menu button with aria-label", () => {
    render(<Header onToggleSidebar={onToggle} />);
    const btn = screen.getByLabelText("Toggle sidebar navigation");
    expect(btn).toBeInTheDocument();
  });

  it("calls onToggleSidebar when hamburger is clicked", () => {
    render(<Header onToggleSidebar={onToggle} />);
    fireEvent.click(screen.getByLabelText("Toggle sidebar navigation"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows system status", () => {
    render(<Header onToggleSidebar={onToggle} />);
    expect(screen.getByText("System Online")).toBeInTheDocument();
  });
});
