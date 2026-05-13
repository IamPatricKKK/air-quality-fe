import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Cigarette, AlertTriangle } from "lucide-react";
import { useStationHistory } from "@/hooks/useStations";
import type { StationHistoryPoint } from "@/types";

interface PersonalExposureProps {
  stationId: string;
}

// One cigarette ≈ 22 µg/m³ of PM2.5 inhaled over 1 hour assuming 0.5 m³/h
// breathing rate. The constant below mirrors the rule of thumb that 1 ug/m3 of
// PM2.5 over 24 hours is roughly equivalent to 1/22 of a cigarette.
const PM25_PER_CIGARETTE_UG = 22;

interface ExposureStats {
  avgPm25: number;
  maxPm25: number;
  cigaretteEquivalent: number;
  hoursAboveWho: number;
  totalHours: number;
}

function computeExposure(points: StationHistoryPoint[]): ExposureStats | null {
  const pm25Values = points
    .map((p) => p.pm25)
    .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
  if (pm25Values.length === 0) return null;

  const sum = pm25Values.reduce((a, b) => a + b, 0);
  const avg = sum / pm25Values.length;
  const max = Math.max(...pm25Values);
  // Cigarette equivalent: ratio of cumulative exposure vs PM25_PER_CIGARETTE_UG
  // scaled by the fraction of a 24-hour window we actually sampled.
  const cigaretteEquivalent = sum / PM25_PER_CIGARETTE_UG / 24;
  const hoursAboveWho = pm25Values.filter((v) => v > 15).length;

  return {
    avgPm25: Math.round(avg * 10) / 10,
    maxPm25: Math.round(max * 10) / 10,
    cigaretteEquivalent: Math.round(cigaretteEquivalent * 10) / 10,
    hoursAboveWho,
    totalHours: pm25Values.length,
  };
}

export function PersonalExposure({ stationId }: PersonalExposureProps) {
  const { data: history } = useStationHistory(stationId, 24);
  const stats = useMemo(() => (history ? computeExposure(history) : null), [history]);

  if (!stats) return null;

  const cigaretteWarning = stats.cigaretteEquivalent >= 0.5;
  const whoWarning = stats.hoursAboveWho > 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Phơi nhiễm cá nhân 24h</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-secondary/40 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Cigarette className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[11px] text-muted-foreground">Tương đương</span>
          </div>
          <p className={`text-2xl font-bold ${cigaretteWarning ? "text-orange-400" : "text-foreground"}`}>
            {stats.cigaretteEquivalent}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">điếu thuốc lá</p>
        </div>

        <div className="rounded-md bg-secondary/40 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${whoWarning ? "text-destructive" : "text-muted-foreground"}`} />
            <span className="text-[11px] text-muted-foreground">Giờ vượt WHO</span>
          </div>
          <p className={`text-2xl font-bold ${whoWarning ? "text-destructive" : "text-foreground"}`}>
            {stats.hoursAboveWho}
            <span className="text-sm text-muted-foreground">/{stats.totalHours}</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">PM2.5 &gt; 15 µg/m³</p>
        </div>

        <div className="rounded-md bg-secondary/40 p-3">
          <p className="text-[11px] text-muted-foreground">PM2.5 trung bình</p>
          <p className="text-xl font-bold text-foreground mt-1">{stats.avgPm25}</p>
          <p className="text-[10px] text-muted-foreground">µg/m³</p>
        </div>

        <div className="rounded-md bg-secondary/40 p-3">
          <p className="text-[11px] text-muted-foreground">PM2.5 cao nhất</p>
          <p className="text-xl font-bold text-foreground mt-1">{stats.maxPm25}</p>
          <p className="text-[10px] text-muted-foreground">µg/m³</p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">
        Ước tính theo công thức của Berkeley Earth: 22 µg/m³ PM2.5 × giờ ≈ 1 điếu thuốc. WHO 2021
        khuyến nghị PM2.5 trung bình năm ≤ 15 µg/m³.
      </p>
    </motion.div>
  );
}
