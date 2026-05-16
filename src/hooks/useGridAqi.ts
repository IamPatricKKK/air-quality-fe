import { useQuery } from "@tanstack/react-query";
import { getGridLatest, type GridPoint } from "@/api/analytics";

/**
 * Hook lấy lưới AQI từ air-quality-be (Open-Meteo CAMS data).
 *
 * Mục đích: bổ sung phủ AQI cho các khu vực không có trạm thật
 * (vd: Nha Trang, Phú Quốc, Tây Nguyên, ĐBSCL...) — giống aqi.in/IQAir.
 *
 * Service backend tự cập nhật mỗi 3 giờ qua cron. Frontend cache 5 phút.
 */
export function useGridAqi(enabled = true) {
  return useQuery<{ count: number; data: GridPoint[] }>({
    queryKey: ["grid-aqi-latest"],
    // 24h window: cron refresh mỗi 3h, nhưng nếu service restart/miss cycle
    // thì data vẫn hiển thị (stale-but-present tốt hơn map trống).
    queryFn: () => getGridLatest({ maxAgeHours: 24 }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000, // refresh mỗi 10 phút
  });
}
