import { useQuery } from "@tanstack/react-query";
import { listWardAqi, type WardAqi } from "@/api/wards";

/**
 * Danh sách xã/phường kèm AQI đã phân tích (từ air-quality-api → DB).
 * air-quality-be cập nhật mỗi 3 giờ qua cron ward_fusion; FE cache 5 phút.
 */
export function useWardAqi(province?: string, enabled = true) {
  return useQuery<WardAqi[]>({
    queryKey: ["ward-aqi", province ?? "all"],
    queryFn: () => listWardAqi(province),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
}
