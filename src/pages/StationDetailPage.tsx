import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Loader2, Map } from "lucide-react";
import { useStations, useStationHistory, useStationAnalytics } from "@/hooks/useStations";
import { StationHero } from "@/components/station/StationHero";
import { AirQualityAlert } from "@/components/station/AirQualityAlert";
import { KeyMetrics } from "@/components/station/KeyMetrics";
import { ForecastPanel } from "@/components/station/ForecastPanel";
import { HistoricalAnalysis } from "@/components/station/HistoricalAnalysis";
import { HealthGuidance } from "@/components/station/HealthGuidance";
import { PollutantAnalysis } from "@/components/station/PollutantAnalysis";
import { EnvironmentalInsights } from "@/components/station/EnvironmentalInsights";
import type { StationWithReading } from "@/types";

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: stations, isLoading } = useStations();
  // One 7-day pull powers hero trends, key metrics, exposure & insights.
  // (Historical section fetches its own range; 7d dedupes via React Query.)
  const { data: history } = useStationHistory(id, 168);
  const { data: analytics } = useStationAnalytics(id);

  const station: StationWithReading | undefined = stations?.find((s) => s.id === id);

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
        <div className="mt-8 ow-card p-8 text-center">
          <h1 className="text-xl font-semibold">Không tìm thấy trạm</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mã trạm <code className="font-mono">{id}</code> không tồn tại trong hệ thống.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sky-soft pb-20 md:pb-10">
      <div className="mx-auto max-w-5xl px-3 md:px-6 pt-4 space-y-4 md:space-y-5">
        <BackButton />

        {/* 1 — Hero */}
        <StationHero station={station} history={history} allStations={stations} />

        {/* 2 — Alert */}
        <AirQualityAlert aqi={station.aqi} />

        {/* 3 — Key metrics */}
        <KeyMetrics station={station} history={history} />

        {/* 4 — Forecast */}
        <ForecastPanel stationId={station.id} />

        {/* 5 — Historical analysis */}
        <HistoricalAnalysis stationId={station.id} stationCode={station.region} />

        {/* 6 — Health guidance */}
        <HealthGuidance aqi={station.aqi} />

        {/* 7 — Pollutant analysis */}
        <PollutantAnalysis station={station} />

        {/* 8 — Environmental insights */}
        <EnvironmentalInsights station={station} history={history} analytics={analytics} />

        {/* Map CTA */}
        <button
          onClick={() => navigate("/home", { state: { viewOnMap: station.id } })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 text-primary text-sm font-medium hover:from-primary/20 hover:to-primary/10 active:scale-[0.98] transition-all"
        >
          <Map className="w-4 h-4" />
          Xem trên bản đồ
        </button>
      </div>
    </div>
  );
}
