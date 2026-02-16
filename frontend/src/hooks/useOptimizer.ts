import { useMutation } from "@tanstack/react-query";
import { runOptimization } from "../services/optimizerApi";
import { OptimizationRequest } from "../types";

export const useOptimizer = () => {
  return useMutation({
    mutationFn: (request: OptimizationRequest) => runOptimization(request),
  });
};
