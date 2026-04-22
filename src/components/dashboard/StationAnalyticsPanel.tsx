import { useStationAnalytics } from "@/hooks/useStations";
import { getAqiCategory, getAqiCategoryByCode } from "@/lib/aqi";

interface Props {
  stationId: string | undefined;
}

function fmt(v: number | null | undefined, digits = 0) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return Number(v).toFixed(digits);
}

export function StationAnalyticsPanel({ stationId }: Props) {
  const { data, isLoading, isError } = useStationAnalytics(stationId);

  if (!stationId) return null;
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Đang tải phân tích 24h và dự báo...
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-destructive">
        Không tải được dữ liệu phân tích cho trạm này.
      </div>
    );
  }

  const s = data.summary_24h;
  const f = data.forecast;
  const cat24 = getAqiCategoryByCode(s.category);
  const cat6 = getAqiCategoryByCode(f.category_6h);

  const slope = f.slope_per_hour ?? 0;
  const trend = slope > 0.5 ? "tăng" : slope < -0.5 ? "giảm" : "ổn định";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tóm tắt 24h qua</h3>
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: cat24.color, color: cat24.textColor }}
          >
            {cat24.labelShort}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Số mẫu</dt>
            <dd className="font-medium">{s.samples}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">AQI trung bình</dt>
            <dd className="font-medium">{fmt(s.aqi_avg)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">AQI min / max</dt>
            <dd className="font-medium">
              {fmt(s.aqi_min)} / {fmt(s.aqi_max)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">PM2.5 / PM10 (µg/m³)</dt>
            <dd className="font-medium">
              {fmt(s.pm25_avg, 1)} / {fmt(s.pm10_avg, 1)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Dự báo 6 giờ tới</h3>
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: cat6.color, color: cat6.textColor }}
          >
            {cat6.labelShort}
          </span>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">+1h</dt>
            <dd className="font-medium">{fmt(f.aqi_next_1h)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">+3h</dt>
            <dd className="font-medium">{fmt(f.aqi_next_3h)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">+6h</dt>
            <dd className="font-medium">{fmt(f.aqi_next_6h)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Xu hướng: <span className="font-medium">{trend}</span> ({fmt(slope, 2)} AQI/h).{" "}
          {cat6.healthAdvice}
        </p>
      </div>
    </div>
  );
}

export default StationAnalyticsPanel;
