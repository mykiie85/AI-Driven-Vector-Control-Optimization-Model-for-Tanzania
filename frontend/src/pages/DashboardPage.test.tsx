import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardPage from "./DashboardPage";

// Mock Header and Dashboard
jest.mock("../components/Layout/Header", () => (props: any) => (
  <header data-testid="header">
    <button data-testid="toggle-sidebar" onClick={props.onToggleSidebar}>Toggle</button>
  </header>
));

jest.mock("../components/Layout/Dashboard", () => (props: any) => (
  <div data-testid="dashboard" data-sidebar-open={props.sidebarOpen}>
    <button data-testid="close-sidebar" onClick={props.onCloseSidebar}>Close</button>
  </div>
));

describe("DashboardPage", () => {
  it("renders Header and Dashboard", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
  });

  it("starts with sidebar closed", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("dashboard")).toHaveAttribute("data-sidebar-open", "false");
  });

  it("toggles sidebar open on header button click", () => {
    render(<DashboardPage />);
    fireEvent.click(screen.getByTestId("toggle-sidebar"));
    expect(screen.getByTestId("dashboard")).toHaveAttribute("data-sidebar-open", "true");
  });

  it("closes sidebar on close callback", () => {
    render(<DashboardPage />);
    fireEvent.click(screen.getByTestId("toggle-sidebar")); // open
    fireEvent.click(screen.getByTestId("close-sidebar")); // close
    expect(screen.getByTestId("dashboard")).toHaveAttribute("data-sidebar-open", "false");
  });

  it("toggles sidebar closed when already open", () => {
    render(<DashboardPage />);
    fireEvent.click(screen.getByTestId("toggle-sidebar")); // open
    fireEvent.click(screen.getByTestId("toggle-sidebar")); // close (toggle)
    expect(screen.getByTestId("dashboard")).toHaveAttribute("data-sidebar-open", "false");
  });
});
