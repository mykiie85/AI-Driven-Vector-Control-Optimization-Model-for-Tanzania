import api from "./api";
import { fetchRegions, fetchRegionDetail } from "./regionApi";

jest.mock("./api");
const mockApi = api as jest.Mocked<typeof api>;

describe("regionApi", () => {
  afterEach(() => jest.clearAllMocks());

  describe("fetchRegions", () => {
    it("calls GET /regions and returns data", async () => {
      const mockData = { type: "FeatureCollection", features: [] };
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await fetchRegions();

      expect(mockApi.get).toHaveBeenCalledWith("/regions");
      expect(result).toEqual(mockData);
    });

    it("propagates errors", async () => {
      mockApi.get.mockRejectedValue(new Error("Network error"));
      await expect(fetchRegions()).rejects.toThrow("Network error");
    });
  });

  describe("fetchRegionDetail", () => {
    it("calls GET /regions/:id and returns data", async () => {
      const mockData = { id: 1, name: "Dar es Salaam", risk_score: 0.82 };
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await fetchRegionDetail(1);

      expect(mockApi.get).toHaveBeenCalledWith("/regions/1");
      expect(result).toEqual(mockData);
    });
  });
});
