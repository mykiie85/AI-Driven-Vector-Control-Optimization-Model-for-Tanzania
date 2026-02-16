import axios from "axios";
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
    // Axios interceptors are an internal AxiosInterceptorManager
    // Check that at least one response interceptor exists
    const interceptors = (api.interceptors.response as any).handlers;
    expect(interceptors.length).toBeGreaterThan(0);
  });
});
