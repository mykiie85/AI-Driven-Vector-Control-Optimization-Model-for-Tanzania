import api from "./api";
import { runOptimization } from "./optimizerApi";

jest.mock("./api");
const mockApi = api as jest.Mocked<typeof api>;

describe("optimizerApi", () => {
  afterEach(() => jest.clearAllMocks());

  it("calls POST /optimize with request body", async () => {
    const mockResponse = { total_budget: 50000, allocations: [] };
    mockApi.post.mockResolvedValue({ data: mockResponse });

    const request = { budget_usd: 50000, region_ids: [1, 2] };
    const result = await runOptimization(request);

    expect(mockApi.post).toHaveBeenCalledWith("/optimize", request);
    expect(result).toEqual(mockResponse);
  });

  it("propagates validation errors", async () => {
    mockApi.post.mockRejectedValue({ response: { status: 422 } });
    await expect(
      runOptimization({ budget_usd: -1, region_ids: [] })
    ).rejects.toBeTruthy();
  });
});
