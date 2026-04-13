import { hasAirQualityApi, airQualityApiRequest } from "@/api/client";
import { getStationHistoryMock, listStationsMock } from "@/api/mock";
import type { StationHistoryPoint, StationWithReading } from "@/types";

export async function listStations() {
  if (!hasAirQualityApi()) {
    return listStationsMock();
  }

  return airQualityApiRequest<StationWithReading[]>("/stations");
}

export async function getStationHistory(stationId: string, hours = 24) {
  if (!hasAirQualityApi()) {
    return getStationHistoryMock(stationId);
  }

  return airQualityApiRequest<StationHistoryPoint[]>(`/stations/${stationId}/history?hours=${hours}`);
}
