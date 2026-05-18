import { airQualityApiRequest } from "./client";

/**
 * Xã/phường kèm AQI ĐÃ PHÂN TÍCH (air-quality-be suy bằng IDW từ trạm thật,
 * lưu DB; air-quality-api trả về). FE chỉ đọc từ API — không call ngoài,
 * không phải trạm trên bản đồ.
 */
export interface WardAqi {
  id: string;
  code: string;
  name: string;
  provinceCode: string | null;
  provinceName: string | null;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  confidence: number | null;
  stationCount: number | null;
  nearestKm: number | null;
  analyzedAt: string | null;
  source: string;
}

export async function listWardAqi(province?: string): Promise<WardAqi[]> {
  const qs = province ? `?province=${encodeURIComponent(province)}` : "";
  return airQualityApiRequest<WardAqi[]>(`/wards${qs}`);
}
