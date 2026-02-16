import api from "./api";
import { ReportRequest, ReportResponse } from "../types";

export const generateReport = async (
  request: ReportRequest
): Promise<ReportResponse> => {
  const { data } = await api.post<ReportResponse>("/report/generate", request);
  return data;
};
