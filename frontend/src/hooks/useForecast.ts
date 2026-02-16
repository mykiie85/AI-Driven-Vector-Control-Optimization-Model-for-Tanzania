import { useQuery } from "@tanstack/react-query";
import { fetchForecast } from "../services/forecastApi";

export const useForecast = (
  regionId: number | null,
  days: number = 30,
  model: string = "prophet"
) => {
  return useQuery({
    queryKey: ["forecast", regionId, days, model],
    queryFn: () => fetchForecast(regionId!, days, model),
    enabled: regionId !== null,
    staleTime: 10 * 60 * 1000,
  });
};
