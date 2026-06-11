import { Link } from "react-router-dom";
import { ExternalLink, MapPin } from "lucide-react";
import { AQIChart } from "@/components/dashboard/AQIChart";
import { StationAnalyticsPanel } from "@/components/dashboard/StationAnalyticsPanel";
import { StationDetail } from "@/components/dashboard/StationDetail";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import type { Station } from "@/data/mockData";

interface Props {
  station: Station;
  onViewOnMap?: () => void;
}

export function SelectedStationPanel({ station, onViewOnMap }: Props) {
  return (
    <div className="space-y-4">
      <Link
        to={`/stations/${station.id}`}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        <ExternalLink className="w-4 h-4" />
        Mở trang chi tiết
      </Link>
      <AQIChart station={station} />
      {onViewOnMap && (
        <button
          onClick={onViewOnMap}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 text-primary text-sm font-medium hover:from-primary/20 hover:to-primary/10 active:scale-[0.98] transition-all"
        >
          <MapPin className="w-4 h-4" />
          Xem trên bản đồ
        </button>
      )}
      <StationAnalyticsPanel stationId={station.id} />
      <ForecastChart stationId={station.id} />
      <StationDetail station={station} />
    </div>
  );
}

export default SelectedStationPanel;
