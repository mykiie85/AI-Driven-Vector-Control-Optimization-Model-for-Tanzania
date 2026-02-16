import api from "./api";
import { generateReport } from "./reportApi";

jest.mock("./api");
const mockApi = api as jest.Mocked<typeof api>;

describe("reportApi", () => {
  afterEach(() => jest.clearAllMocks());

  it("calls POST /report/generate with request body", async () => {
    const mockResponse = {
      summary: "Test summary",
      regions_analyzed: 2,
      model_used: "facebook/bart-large-cnn",
    };
    mockApi.post.mockResolvedValue({ data: mockResponse });

    const request = {
      region_ids: [1, 2],
      include_forecast: true,
      include_optimization: false,
    };
    const result = await generateReport(request);

    expect(mockApi.post).toHaveBeenCalledWith("/report/generate", request);
    expect(result).toEqual(mockResponse);
  });

  it("propagates errors", async () => {
    mockApi.post.mockRejectedValue(new Error("NLP model unavailable"));
    await expect(
      generateReport({ region_ids: [1], include_forecast: true, include_optimization: true })
    ).rejects.toThrow("NLP model unavailable");
  });
});
