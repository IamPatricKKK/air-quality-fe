import { motion } from "framer-motion";
import { MapPin, Clock, TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { format } from "date-fns";
import type { StationHistoryPoint, StationWithReading } from "@/types";
import {
  aqiColors,
  aqiLabel,
  computeHeroTrends,
  computeProvinceRank,
  type Trend,
} from "./stationInsights";

interface Props {
  station: StationWithReading;
  history?: StationHistoryPoint[];
  allStations?: StationWithReading[];
}

const GOOD = "hsl(142 58% 36%)";
const BAD = "hsl(16 100% 50%)";

/** Direction tone — rising AQI/pollution is "bad", falling is "good". */
function trendVisual(dir: Trend["dir"]) {
  if (dir === "up") return { Icon: TrendingUp, color: BAD, bg: "hsl(16 100% 50% / 0.12)", word: "tăng" };
  if (dir === "down") return { Icon: TrendingDown, color: GOOD, bg: "hsl(142 58% 36% / 0.12)", word: "giảm" };
  return { Icon: Minus, color: "hsl(var(--muted-foreground))", bg: "hsl(201 100% 14% / 0.06)", word: "ổn định" };
}

/** Large animated radial AQI gauge — the dominant focal point of the page. */
function AqiGauge({ aqi }: { aqi: number }) {
  const { solid, tint } = aqiColors(aqi);
  const size = 232;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const fraction = Math.max(0, Math.min(aqi / 300, 1));

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tint} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={solid}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - fraction) }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="section-label">AQI</span>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="leading-none"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "4.5rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
            color: solid,
          }}
        >
          {aqi}
        </motion.span>
        <span
          className="mt-1 rounded-full px-3 py-1 text-xs font-bold text-center max-w-[170px] leading-tight"
          style={{ background: tint, color: solid }}
        >
          {aqiLabel(aqi)}
        </span>
      </div>
    </div>
  );
}

function TrendChip({ label, trend }: { label: string; trend: Trend | null }) {
  if (!trend) return null;
  const { Icon, color, bg, word } = trendVisual(trend.dir);
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-card/70 border border-border/50 px-3 py-2.5 backdrop-blur-sm">
      <span
        className="flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: bg }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium leading-tight">{label}</p>
        <p className="text-sm font-bold leading-tight" style={{ color }}>
          {word}
          {trend.dir !== "flat" && (
            <span className="ml-1 text-xs font-semibold tabular-nums">
              {trend.delta > 0 ? "+" : ""}
              {Math.round(trend.delta)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function StationHero({ station, history, allStations }: Props) {
  const { solid, tint } = aqiColors(station.aqi);
  const trends = computeHeroTrends(station.aqi, history);
  const rank = computeProvinceRank(station, allStations);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="ow-card relative overflow-hidden"
      style={{ borderColor: solid, boxShadow: `0 1px 2px hsl(201 100% 14% / 0.04), 0 24px 56px -28px ${solid}` }}
    >
      {/* AQI-tinted wash */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 85% 0%, ${tint} 0%, transparent 55%)` }}
      />

      <div className="relative grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        {/* Identity + context */}
        <div className="min-w-0 order-2 lg:order-1">
          <h1 className="text-2xl md:text-[2rem] font-bold leading-tight tracking-tight text-foreground">
            {station.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: solid }} />
              {station.region}
            </span>
            {station.recorded_at && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                Cập nhật {format(new Date(station.recorded_at), "HH:mm · dd/MM/yyyy")}
              </span>
            )}
          </div>

          {/* Context chips */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:max-w-md">
            <TrendChip label="So với hôm qua" trend={trends.vsYesterday} />
            <TrendChip label="So với TB 7 ngày" trend={trends.vs7day} />
            {rank && (
              <div className="col-span-2 flex items-center gap-2.5 rounded-xl bg-card/70 border border-border/50 px-3 py-2.5 backdrop-blur-sm">
                <span
                  className="flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: tint }}
                >
                  <Trophy className="w-4 h-4" style={{ color: solid }} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                    Xếp hạng ô nhiễm trong tỉnh
                  </p>
                  <p className="text-sm font-bold leading-tight text-foreground">
                    Hạng {rank.rank}
                    <span className="text-muted-foreground font-medium">/{rank.total} trạm · {rank.province}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dominant AQI gauge */}
        <div className="order-1 lg:order-2 flex justify-center">
          <AqiGauge aqi={station.aqi} />
        </div>
      </div>
    </motion.section>
  );
}

export default StationHero;
