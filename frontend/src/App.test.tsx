import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Mock DashboardPage to avoid loading the whole app tree
jest.mock("./pages/DashboardPage", () => () => (
  <div data-testid="dashboard-page">Dashboard</div>
));

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
  });
});
