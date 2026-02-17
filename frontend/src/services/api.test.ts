import api from "./api";

describe("API client", () => {
  it("has correct baseURL from env or default", () => {
    expect(api.defaults.baseURL).toBe("http://localhost:8000/api/v1");
  });

  it("has 30s timeout", () => {
    expect(api.defaults.timeout).toBe(30000);
  });

  it("sets Content-Type to application/json", () => {
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("has response error interceptor", () => {
    const interceptors = (api.interceptors.response as any).handlers;
    expect(interceptors.length).toBeGreaterThan(0);
  });

  it("error interceptor rejects with error and logs", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const interceptors = (api.interceptors.response as any).handlers;
    const errorHandler = interceptors[0].rejected;

    const mockError = { response: { data: { detail: "Not found" } }, message: "Request failed" };

    await expect(errorHandler(mockError)).rejects.toBe(mockError);
    expect(consoleSpy).toHaveBeenCalledWith("API Error:", { detail: "Not found" });
    consoleSpy.mockRestore();
  });

  it("error interceptor handles missing response", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const interceptors = (api.interceptors.response as any).handlers;
    const errorHandler = interceptors[0].rejected;

    const mockError = { message: "Network Error" };

    await expect(errorHandler(mockError)).rejects.toBe(mockError);
    expect(consoleSpy).toHaveBeenCalledWith("API Error:", "Network Error");
    consoleSpy.mockRestore();
  });

  it("success interceptor passes response through", () => {
    const interceptors = (api.interceptors.response as any).handlers;
    const successHandler = interceptors[0].fulfilled;

    const mockResponse = { data: { test: true }, status: 200 };
    expect(successHandler(mockResponse)).toBe(mockResponse);
  });
});
