import { motion } from "framer-motion";
import { Wind, Factory, Cigarette, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StationHistoryPoint, StationWithReading } from "@/types";
import { computeExposure, computeMetricTrend, type Trend } from "./stationInsights";

interface Props {
  station: StationWithReading;
  history?: StationHistoryPoint[];
}

const BAD = "hsl(16 100% 50%)";
const GOOD = "hsl(142 58% 36%)";

function TrendBadge({ trend, invert = false }: { trend: Trend | null; invert?: boolean }) {
  if (!trend) return null;
  // For pollutants, rising is bad. `invert` flips that (unused for now).
  const rising = trend.dir === "up";
  const Icon = trend.dir === "up" ? TrendingUp : trend.dir === "down" ? TrendingDown : Minus;
  const color =
    trend.dir === "flat"
      ? "hsl(var(--muted-foreground))"
      : rising === !invert
        ? BAD
        : GOOD;
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums" style={{ color }}>
      <Icon className="w-3.5 h-3.5" />
      {trend.dir !== "flat" && `${trend.pct > 0 ? "+" : ""}${Math.round(trend.pct)}%`}
    </span>
  );
}

interface MetricCard {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  sub: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  accent: string;
  trend?: Trend | null;
}

export function KeyMetrics({ station, history }: Props) {
  const exposure = computeExposure(history);
  const pm25Trend = computeMetricTrend(history, "pm25");
  const pm10Trend = computeMetricTrend(history, "pm10");

  const whoWarning = exposure ? exposure.hoursAboveWho > 12 : false;
  const cigWarning = exposure ? exposure.cigaretteEquivalent >= 0.5 : false;

  const cards: MetricCard[] = [
    {
      icon: Wind,
      label: "PM2.5",
      value: station.pm25,
      unit: "µg/m³",
      sub: "Bụi mịn — tác nhân chính",
      iconBg: "hsl(16 100% 50% / 0.12)",
      iconColor: "hsl(16 100% 50%)",
      valueColor: "hsl(201 100% 14%)",
      accent: "hsl(16 100% 55%)",
      trend: pm25Trend,
    },
    {
      icon: Factory,
      label: "PM10",
      value: station.pm10,
      unit: "µg/m³",
      sub: "Bụi thô lơ lửng",
      iconBg: "hsl(203 39% 57% / 0.14)",
      iconColor: "hsl(203 39% 50%)",
      valueColor: "hsl(201 100% 14%)",
      accent: "hsl(203 39% 57%)",
      trend: pm10Trend,
    },
    {
      icon: AlertTriangle,
      label: "Vượt ngưỡng WHO",
      value: exposure ? `${exposure.hoursAboveWho}/${exposure.totalHours}` : "—",
      sub: "Giờ PM2.5 > 15 µg/m³ (24h)",
      iconBg: whoWarning ? "hsl(0 72% 50% / 0.12)" : "hsl(201 100% 14% / 0.07)",
      iconColor: whoWarning ? "hsl(0 72% 50%)" : "hsl(201 40% 45%)",
      valueColor: whoWarning ? "hsl(0 72% 45%)" : "hsl(201 100% 14%)",
      accent: whoWarning ? "hsl(0 72% 50%)" : "hsl(201 40% 55%)",
    },
    {
      icon: Cigarette,
      label: "Tương đương phơi nhiễm",
      value: exposure ? exposure.cigaretteEquivalent : "—",
      unit: "điếu",
      sub: "Quy đổi thuốc lá (24h)",
      iconBg: cigWarning ? "hsl(28 90% 50% / 0.14)" : "hsl(28 90% 50% / 0.10)",
      iconColor: "hsl(28 90% 44%)",
      valueColor: cigWarning ? "hsl(28 90% 40%)" : "hsl(201 100% 14%)",
      accent: "hsl(28 90% 50%)",
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="ow-card relative overflow-hidden p-4 md:p-5"
        >
          <span className="absolute inset-y-0 left-0 w-[3px] rounded-full" style={{ background: card.accent }} />

          <div className="flex items-center justify-between gap-2">
            <span className="flex w-10 h-10 rounded-xl items-center justify-center" style={{ background: card.iconBg }}>
              <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
            </span>
            {card.trend !== undefined && <TrendBadge trend={card.trend} />}
          </div>

          <p className="mt-3 section-label">{card.label}</p>

          <div className="mt-1 flex items-baseline gap-1">
            <span
              className="leading-none"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
                color: card.valueColor,
              }}
            >
              {card.value}
            </span>
            {card.unit && <span className="text-xs text-muted-foreground font-medium">{card.unit}</span>}
          </div>

          <p className="mt-1.5 text-[11px] text-muted-foreground truncate font-medium">{card.sub}</p>
        </motion.div>
      ))}
    </section>
  );
}

export default KeyMetrics;
