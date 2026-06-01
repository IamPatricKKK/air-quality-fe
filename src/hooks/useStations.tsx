import { useQuery } from "@tanstack/react-query";
import { getStationAnalytics, getStationHistory, listStations } from "@/api/stations";
import type { StationAnalytics, StationHistoryPoint, StationWithReading } from "@/types";

export type { StationAnalytics, StationHistoryPoint, StationWithReading };

export function useStations() {
  return useQuery({
    queryKey: ["stations-with-readings"],
    queryFn: (): Promise<StationWithReading[]> => listStations(),
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useStationHistory(stationId: string | undefined, hours = 24) {
  return useQuery({
    queryKey: ["station-history", stationId, hours],
    queryFn: (): Promise<StationHistoryPoint[]> => {
      if (!stationId) {
        return Promise.resolve([]);
      }
      return getStationHistory(stationId, hours);
    },
    enabled: Boolean(stationId),
  });
}

export function useStationAnalytics(stationId: string | undefined) {
  return useQuery({
    queryKey: ["station-analytics", stationId],
    queryFn: (): Promise<StationAnalytics> => {
      if (!stationId) return Promise.reject(new Error("no station"));
      return getStationAnalytics(stationId);
    },
    enabled: Boolean(stationId),
    refetchInterval: 5 * 60 * 1000,
    // Đừng retry khi bị rate-limit (429) — retry chỉ làm cạn quota nhanh hơn.
    retry: (count, err) => !String(err).includes("429") && count < 2,
  });
}
