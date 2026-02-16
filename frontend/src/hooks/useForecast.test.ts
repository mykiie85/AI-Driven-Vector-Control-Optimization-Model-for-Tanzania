import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useForecast } from "./useForecast";
import * as forecastApi from "../services/forecastApi";

jest.mock("../services/forecastApi");

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe("useForecast", () => {
  afterEach(() => jest.clearAllMocks());

  it("does not fetch when regionId is null", () => {
    renderHook(() => useForecast(null), { wrapper: createWrapper() });
    expect(forecastApi.fetchForecast).not.toHaveBeenCalled();
  });

  it("fetches forecast when regionId is provided", async () => {
    const mockData = { region_id: 1, points: [] };
    (forecastApi.fetchForecast as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useForecast(1, 30, "prophet"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(forecastApi.fetchForecast).toHaveBeenCalledWith(1, 30, "prophet");
    expect(result.current.data).toEqual(mockData);
  });

  it("passes custom days and model", async () => {
    (forecastApi.fetchForecast as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useForecast(2, 60, "arima"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(forecastApi.fetchForecast).toHaveBeenCalledWith(2, 60, "arima");
  });
});
