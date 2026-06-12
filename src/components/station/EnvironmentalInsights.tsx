import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, FlaskConical, Cigarette, CloudSun, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAqiCategoryByCode } from "@/lib/aqi";
import type { StationAnalytics, StationHistoryPoint, StationWithReading } from "@/types";
import { analyzePollutants, computeExposure, computeMetricTrend, aqiColors } from "./stationInsights";

interface Props {
  station: StationWithReading;
  history?: StationHistoryPoint[];
  analytics?: StationAnalytics;
}

interface Insight {
  Icon: LucideIcon;
  label: string;
  headline: string;
  detail: string;
  color: string;
  tint: string;
}

const NAVY = "hsl(201 100% 14%)";
const NAVY_TINT = "hsl(201 100% 14% / 0.07)";

export function EnvironmentalInsights({ station, history, analytics }: Props) {
  const insights: Insight[] = [];

  /* 1 — Pollution trend */
  const aqiTrend = computeMetricTrend(history, "aqi", 2);
  const slope = analytics?.forecast.slope_per_hour ?? null;
  {
    let dir: "up" | "down" | "flat" = "flat";
    if (aqiTrend) dir = aqiTrend.dir;
    else if (slope != null) dir = slope > 0.5 ? "up" : slope < -0.5 ? "down" : "flat";

    const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
    const color = dir === "up" ? "hsl(16 100% 50%)" : dir === "down" ? "hsl(142 58% 36%)" : NAVY;
    const tint = dir === "up" ? "hsl(16 100% 50% / 0.12)" : dir === "down" ? "hsl(142 58% 36% / 0.12)" : NAVY_TINT;
    const headline = dir === "up" ? "Đang xấu đi" : dir === "down" ? "Đang cải thiện" : "Ổn định";
    const detail =
      dir === "up"
        ? "Chỉ số AQI có xu hướng tăng so với hôm qua."
        : dir === "down"
          ? "Chỉ số AQI giảm dần, không khí đang tốt lên."
          : "Chất lượng không khí không biến động đáng kể.";
    insights.push({ Icon, label: "Xu hướng ô nhiễm", headline, detail, color, tint });
  }

  /* 2 — Main pollutant */
  {
    const dominant = analyzePollutants(station)[0];
    insights.push({
      Icon: FlaskConical,
      label: "Chất ô nhiễm chính",
      headline: dominant.meta.label,
      detail: `${dominant.meta.name} ở mức ${Math.round(dominant.ratio * 100)}% ngưỡng khuyến nghị.`,
      color: dominant.color,
      tint: dominant.tint,
    });
  }

  /* 3 — Exposure risk */
  {
    const ex = computeExposure(history);
    const cig = ex?.cigaretteEquivalent ?? 0;
    const high = cig >= 0.5;
    const headline = ex ? `${cig} điếu/ngày` : "—";
    const detail = ex
      ? high
        ? `Tương đương hút ${cig} điếu thuốc — mức phơi nhiễm đáng kể.`
        : `Phơi nhiễm thấp, tương đương ${cig} điếu thuốc lá.`
      : "Chưa đủ dữ liệu phơi nhiễm 24h.";
    insights.push({
      Icon: Cigarette,
      label: "Mức phơi nhiễm",
      headline,
      detail,
      color: high ? "hsl(28 90% 44%)" : NAVY,
      tint: high ? "hsl(28 90% 50% / 0.12)" : NAVY_TINT,
    });
  }

  /* 4 — Forecast outlook */
  {
    const next6 = analytics?.forecast.aqi_next_6h ?? null;
    const cat6 = getAqiCategoryByCode(analytics?.forecast.category_6h);
    const colors = next6 != null ? aqiColors(next6) : { solid: NAVY, tint: NAVY_TINT };
    insights.push({
      Icon: CloudSun,
      label: "Triển vọng 6 giờ tới",
      headline: next6 != null ? `AQI ~${Math.round(next6)}` : "—",
      detail: next6 != null ? `Dự kiến ở mức "${cat6.label}".` : "Chưa có dữ liệu dự báo ngắn hạn.",
      color: colors.solid,
      tint: colors.tint,
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="ow-card p-5 md:p-6"
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">Tổng quan môi trường</h2>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="rounded-xl border border-border/50 bg-card/60 p-4"
          >
            <span className="flex w-9 h-9 items-center justify-center rounded-xl" style={{ background: it.tint }}>
              <it.Icon className="w-5 h-5" style={{ color: it.color }} />
            </span>
            <p className="mt-3 section-label">{it.label}</p>
            <p className="mt-1 text-lg font-bold leading-tight" style={{ color: it.color }}>
              {it.headline}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-snug">{it.detail}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default EnvironmentalInsights;
