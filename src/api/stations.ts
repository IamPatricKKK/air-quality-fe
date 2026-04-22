import { airQualityApiRequest } from "@/api/client";
import type { StationAnalytics, StationHistoryPoint, StationWithReading } from "@/types";

export async function listStations() {
  return airQualityApiRequest<StationWithReading[]>("/stations");
}

export async function getStationHistory(stationId: string, hours = 24) {
  return airQualityApiRequest<StationHistoryPoint[]>(
    `/stations/${stationId}/history?hours=${hours}`,
  );
}

export async function getStationAnalytics(stationId: string) {
  return airQualityApiRequest<StationAnalytics>(`/stations/${stationId}/analytics`);
}
