import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReport } from "./useReport";
import * as reportApi from "../services/reportApi";

jest.mock("../services/reportApi");

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe("useReport", () => {
  afterEach(() => jest.clearAllMocks());

  it("calls generateReport on mutate", async () => {
    const mockResponse = {
      summary: "Test summary",
      regions_analyzed: 1,
      model_used: "facebook/bart-large-cnn",
    };
    (reportApi.generateReport as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useReport(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        region_ids: [1],
        include_forecast: true,
        include_optimization: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reportApi.generateReport).toHaveBeenCalledWith({
      region_ids: [1],
      include_forecast: true,
      include_optimization: true,
    });
    expect(result.current.data).toEqual(mockResponse);
  });

  it("handles generation failure", async () => {
    (reportApi.generateReport as jest.Mock).mockRejectedValue(new Error("NLP failed"));

    const { result } = renderHook(() => useReport(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        region_ids: [1],
        include_forecast: true,
        include_optimization: true,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
