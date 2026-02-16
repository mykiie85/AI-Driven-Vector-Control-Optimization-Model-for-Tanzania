import api from "./api";
import { RegionGeoJSON, RegionDetail } from "../types";

export const fetchRegions = async (): Promise<RegionGeoJSON> => {
  const { data } = await api.get<RegionGeoJSON>("/regions");
  return data;
};

export const fetchRegionDetail = async (id: number): Promise<RegionDetail> => {
  const { data } = await api.get<RegionDetail>(`/regions/${id}`);
  return data;
};
