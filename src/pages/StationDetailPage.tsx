import { Link, useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Loader2, MapPin, Map, Wind, Droplets, Thermometer, CloudFog, Factory } from "lucide-react";
import { format } from "date-fns";
import { useStations, useStationHistory, useStationAnalytics } from "@/hooks/useStations";
import { AQIChart } from "@/components/dashboard/AQIChart";
import { AQICalendar } from "@/components/dashboard/AQICalendar";
import { HealthAdvice } from "@/components/dashboard/HealthAdvice";
import { PersonalExposure } from "@/components/dashboard/PersonalExposure";
import { StationDetail } from "@/components/dashboard/StationDetail";
import { StationAnalyticsPanel } from "@/components/dashboard/StationAnalyticsPanel";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { MetricTile } from "@/components/dashboard/MetricTile";
import { getAqiCategory } from "@/lib/aqi";
import type { StationWithReading } from "@/types";

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: stations, isLoading } = useStations();
  const { data: history } = useStationHistory(id, 24);
  const { data: analytics } = useStationAnalytics(id);

  const navigate = useNavigate();
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
        <BackButton />
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
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Sky hero with current conditions */}
      <div className="sky-hero px-3 md:px-6 pt-3 pb-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <BackButton />

          <div className="ow-card-glass p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{station.name}</h1>
                <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {station.region}
                </p>
                {station.recorded_at && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cập nhật: {format(new Date(station.recorded_at), "dd/MM/yyyy HH:mm")}
                  </p>
                )}
              </div>
              <div
                className="rounded-2xl px-6 py-4 text-center min-w-[140px] self-start shadow-lg"
                style={{ backgroundColor: epa.color, color: epa.textColor }}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-80">AQI hiện tại</div>
                <div className="text-5xl font-bold font-display leading-none my-1.5">{station.aqi}</div>
                <div className="text-xs font-medium">{epa.label}</div>
              </div>
            </div>

            {/* Metric grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <MetricTile icon={CloudFog} label="PM2.5" value={station.pm25} unit="µg/m³" />
              <MetricTile icon={Factory} label="PM10" value={station.pm10} unit="µg/m³" />
              <MetricTile icon={Thermometer} label="Nhiệt độ" value={station.temperature} unit="°C" />
              <MetricTile icon={Droplets} label="Độ ẩm" value={station.humidity} unit="%" />
              <MetricTile icon={Wind} label="Gió" value={station.wind_speed} unit="m/s" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-6 px-3 md:px-6 space-y-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HealthAdvice aqi={station.aqi} />
          <PersonalExposure stationId={station.id} />
        </div>

        <StationAnalyticsPanel stationId={station.id} />

        <ForecastChart stationId={station.id} />

        <AQICalendar stationId={station.id} days={30} />

        <AQIChart station={station} />

        <button
          onClick={() => navigate('/home', { state: { viewOnMap: station.id } })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 text-primary text-sm font-medium hover:from-primary/20 hover:to-primary/10 active:scale-[0.98] transition-all"
        >
          <Map className="w-4 h-4" />
          Xem trên bản đồ
        </button>

        <StationDetail station={station} />

        {analytics && history && history.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Chưa có dữ liệu lịch sử 24h cho trạm này.
          </p>
        )}
      </div>
    </div>
  );
}
