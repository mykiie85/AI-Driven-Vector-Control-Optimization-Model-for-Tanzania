import { useMutation } from "@tanstack/react-query";
import { generateReport } from "../services/reportApi";
import { ReportRequest } from "../types";

export const useReport = () => {
  return useMutation({
    mutationFn: (request: ReportRequest) => generateReport(request),
  });
};
