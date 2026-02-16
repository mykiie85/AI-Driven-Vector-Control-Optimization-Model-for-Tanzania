import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorAlert from "./ErrorAlert";

describe("ErrorAlert", () => {
  it("renders error message", () => {
    render(<ErrorAlert message="Something went wrong" />);
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it("renders default title", () => {
    render(<ErrorAlert message="Failure" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<ErrorAlert message="Failure" title="Network Error" />);
    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("has role=alert for accessibility", () => {
    render(<ErrorAlert message="Error occurred" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = jest.fn();
    render(<ErrorAlert message="Error occurred" onRetry={onRetry} />);
    const btn = screen.getByRole("button", { name: /retry/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorAlert message="Error occurred" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
