import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useStations, useStationHistory, useStationAnalytics } from "@/hooks/useStations";
import { AQIChart } from "@/components/dashboard/AQIChart";
import { StationDetail } from "@/components/dashboard/StationDetail";
import { StationAnalyticsPanel } from "@/components/dashboard/StationAnalyticsPanel";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { getAqiCategory } from "@/lib/aqi";
import type { StationWithReading } from "@/types";

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: stations, isLoading } = useStations();
  const { data: history } = useStationHistory(id, 24);
  const { data: analytics } = useStationAnalytics(id);

  const station: StationWithReading | undefined = stations?.find((s) => s.id === id);
  const epa = getAqiCategory(station?.aqi);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Đang tải trạm...
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Quay lại dashboard
        </Link>
        <div className="mt-8 glass-card p-8 text-center">
          <h1 className="text-xl font-semibold">Không tìm thấy trạm</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mã trạm <code className="font-mono">{id}</code> không tồn tại trong hệ thống.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 space-y-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Quay lại dashboard
      </Link>

      <div className="glass-card p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{station.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" /> {station.region}
          </p>
          {station.recorded_at && (
            <p className="mt-1 text-xs text-muted-foreground">
              Cập nhật: {format(new Date(station.recorded_at), "dd/MM/yyyy HH:mm")}
            </p>
          )}
        </div>
        <div
          className="rounded-xl px-5 py-4 text-center min-w-[140px]"
          style={{ backgroundColor: epa.color, color: epa.textColor }}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-80">AQI hiện tại</div>
          <div className="text-4xl font-bold font-display">{station.aqi}</div>
          <div className="text-xs font-medium">{epa.label}</div>
        </div>
      </div>

      {epa.healthAdvice && (
        <div
          className="glass-card p-4 text-sm border-l-4"
          style={{ borderLeftColor: epa.color }}
        >
          <strong>Khuyến nghị sức khoẻ:</strong> {epa.healthAdvice}
        </div>
      )}

      <StationAnalyticsPanel stationId={station.id} />

      <ForecastChart stationId={station.id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AQIChart station={station} />
        <StationDetail station={station} />
      </div>

      {analytics && history && history.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Chưa có dữ liệu lịch sử 24h cho trạm này.
        </p>
      )}
    </div>
  );
}
