import api from "./api";
import { OptimizationRequest, OptimizationResponse } from "../types";

export const runOptimization = async (
  request: OptimizationRequest
): Promise<OptimizationResponse> => {
  const { data } = await api.post<OptimizationResponse>("/optimize", request);
  return data;
};
