import api from "./api";
import { fetchForecast } from "./forecastApi";

jest.mock("./api");
const mockApi = api as jest.Mocked<typeof api>;

describe("forecastApi", () => {
  afterEach(() => jest.clearAllMocks());

  it("calls GET /forecast/:regionId with default params", async () => {
    const mockData = { region_id: 1, points: [] };
    mockApi.get.mockResolvedValue({ data: mockData });

    const result = await fetchForecast(1);

    expect(mockApi.get).toHaveBeenCalledWith("/forecast/1", {
      params: { days: 30, model: "prophet" },
    });
    expect(result).toEqual(mockData);
  });

  it("passes custom days and model", async () => {
    mockApi.get.mockResolvedValue({ data: {} });

    await fetchForecast(5, 60, "arima");

    expect(mockApi.get).toHaveBeenCalledWith("/forecast/5", {
      params: { days: 60, model: "arima" },
    });
  });

  it("propagates errors", async () => {
    mockApi.get.mockRejectedValue(new Error("Server error"));
    await expect(fetchForecast(1)).rejects.toThrow("Server error");
  });
});
