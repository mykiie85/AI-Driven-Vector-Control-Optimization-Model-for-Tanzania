import { useQuery } from "@tanstack/react-query";
import { fetchRegions, fetchRegionDetail } from "../services/regionApi";

export const useRegions = () => {
  return useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegions,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRegionDetail = (id: number | null) => {
  return useQuery({
    queryKey: ["region", id],
    queryFn: () => fetchRegionDetail(id!),
    enabled: id !== null,
  });
};
