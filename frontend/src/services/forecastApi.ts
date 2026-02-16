import api from "./api";
import { ForecastResponse } from "../types";

export const fetchForecast = async (
  regionId: number,
  days: number = 30,
  model: string = "prophet"
): Promise<ForecastResponse> => {
  const { data } = await api.get<ForecastResponse>(
    `/forecast/${regionId}`,
    { params: { days, model } }
  );
  return data;
};
