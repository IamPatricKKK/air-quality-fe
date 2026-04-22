import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { AQIChart } from "@/components/dashboard/AQIChart";
import { StationAnalyticsPanel } from "@/components/dashboard/StationAnalyticsPanel";
import { StationDetail } from "@/components/dashboard/StationDetail";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import type { Station } from "@/data/mockData";

interface Props {
  station: Station;
}

export function SelectedStationPanel({ station }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          to={`/stations/${station.id}`}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Mở trang chi tiết <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      <AQIChart station={station} />
      <StationAnalyticsPanel stationId={station.id} />
      <ForecastChart stationId={station.id} />
      <StationDetail station={station} />
    </div>
  );
}

export default SelectedStationPanel;
