import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOptimizer } from "./useOptimizer";
import * as optimizerApi from "../services/optimizerApi";

jest.mock("../services/optimizerApi");

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe("useOptimizer", () => {
  afterEach(() => jest.clearAllMocks());

  it("calls runOptimization on mutate", async () => {
    const mockResponse = { total_budget: 10000, allocations: [] };
    (optimizerApi.runOptimization as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useOptimizer(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ budget_usd: 10000, region_ids: [1] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(optimizerApi.runOptimization).toHaveBeenCalledWith({
      budget_usd: 10000,
      region_ids: [1],
    });
    expect(result.current.data).toEqual(mockResponse);
  });

  it("handles mutation error", async () => {
    (optimizerApi.runOptimization as jest.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useOptimizer(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ budget_usd: 100, region_ids: [1] });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
