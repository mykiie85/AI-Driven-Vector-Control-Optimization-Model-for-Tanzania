import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRegions, useRegionDetail } from "./useRegions";
import * as regionApi from "../services/regionApi";

jest.mock("../services/regionApi");

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe("useRegions", () => {
  it("fetches regions and returns data", async () => {
    const mockData = { type: "FeatureCollection", features: [] };
    (regionApi.fetchRegions as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRegions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(regionApi.fetchRegions).toHaveBeenCalledTimes(1);
  });

  it("handles fetch error", async () => {
    (regionApi.fetchRegions as jest.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useRegions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useRegionDetail", () => {
  it("does not fetch when id is null", () => {
    (regionApi.fetchRegionDetail as jest.Mock).mockResolvedValue({});

    renderHook(() => useRegionDetail(null), { wrapper: createWrapper() });

    expect(regionApi.fetchRegionDetail).not.toHaveBeenCalled();
  });

  it("fetches when id is provided", async () => {
    const mockData = { id: 1, name: "Dar es Salaam" };
    (regionApi.fetchRegionDetail as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRegionDetail(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
