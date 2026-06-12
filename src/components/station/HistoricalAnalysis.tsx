import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceArea,
} from "recharts";
import { format } from "date-fns";
import { History, Loader2, Gauge, ArrowUp, ArrowDown, AlertOctagon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStationHistory } from "@/hooks/useStations";
import { CsvDownloadButton } from "@/components/CsvDownloadButton";
import { SegmentedControl } from "./SegmentedControl";
import { AQI_BANDS, AQI_UNHEALTHY_THRESHOLD, aqiColors } from "./stationInsights";

interface Props {
  stationId: string;
  stationCode?: string;
}

const RANGES = [
  { value: "24h", label: "24 giờ", hours: 24, bucket: "hour" as const },
  { value: "7d", label: "7 ngày", hours: 168, bucket: "day" as const },
  { value: "30d", label: "30 ngày", hours: 720, bucket: "day" as const },
  { value: "90d", label: "90 ngày", hours: 2160, bucket: "day" as const },
] as const;

type RangeValue = (typeof RANGES)[number]["value"];

export function HistoricalAnalysis({ stationId, stationCode }: Props) {
  const [range, setRange] = useState<RangeValue>("7d");
  const cfg = RANGES.find((r) => r.value === range)!;
  const { data: history, isLoading } = useStationHistory(stationId, cfg.hours);

  const { series, stats } = useMemo(() => {
    const points = (history ?? [])
      .map((p) => ({ ts: new Date(p.recorded_at).getTime(), aqi: p.aqi }))
      .filter((p) => Number.isFinite(p.aqi))
      .sort((a, b) => a.ts - b.ts);

    if (points.length === 0) return { series: [], stats: null };

    // Bucket into day averages for long ranges; keep hourly for 24h.
    let series: { label: string; aqi: number }[];
    if (cfg.bucket === "hour") {
      series = points.map((p) => ({ label: format(new Date(p.ts), "HH:mm"), aqi: Math.round(p.aqi) }));
    } else {
      const byDay = new Map<string, { sum: number; n: number; ts: number }>();
      for (const p of points) {
        const key = format(new Date(p.ts), "yyyy-MM-dd");
        const cur = byDay.get(key) ?? { sum: 0, n: 0, ts: p.ts };
        cur.sum += p.aqi;
        cur.n += 1;
        byDay.set(key, cur);
      }
      series = [...byDay.entries()]
        .sort((a, b) => a[1].ts - b[1].ts)
        .map(([key, v]) => ({ label: format(new Date(key), "dd/MM"), aqi: Math.round(v.sum / v.n) }));
    }

    const aqis = series.map((s) => s.aqi);
    const avg = Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length);
    const max = Math.max(...aqis);
    const min = Math.min(...aqis);
    const exceedance = aqis.filter((a) => a > AQI_UNHEALTHY_THRESHOLD).length;

    return { series, stats: { avg, max, min, exceedance, count: aqis.length } };
  }, [history, cfg.bucket]);

  const yMax = stats ? Math.max(stats.max, 60) : 100;
  const lineColor = stats ? aqiColors(stats.avg).solid : "hsl(201 100% 14%)";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="ow-card p-5 md:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <History className="w-4 h-4 text-primary" />
          Phân tích lịch sử
        </h2>
        <div className="flex items-center gap-2">
          <SegmentedControl options={RANGES} value={range} onChange={setRange} layoutId="history-range" />
          <CsvDownloadButton stationId={stationId} stationCode={stationCode} hours={cfg.hours} />
        </div>
      </div>

      {/* Stat summary */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <StatBox icon={Gauge} label="AQI trung bình" value={stats.avg} tone="neutral" />
          <StatBox icon={ArrowUp} label="AQI cao nhất" value={stats.max} tone="bad" />
          <StatBox icon={ArrowDown} label="AQI thấp nhất" value={stats.min} tone="good" />
          <StatBox
            icon={AlertOctagon}
            label="Lần vượt ngưỡng"
            value={stats.exceedance}
            sub={`/ ${stats.count} · AQI>100`}
            tone={stats.exceedance > 0 ? "bad" : "good"}
          />
        </div>
      )}

      {/* Chart */}
      <div className="mt-4 h-64 md:h-72">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Đang tải dữ liệu…</span>
          </div>
        ) : series.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Chưa có dữ liệu lịch sử cho khoảng thời gian này.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              {AQI_BANDS.filter((b) => b.y1 < yMax).map((b) => (
                <ReferenceArea key={b.level} y1={b.y1} y2={b.y2} fill={b.color} fillOpacity={0.05} ifOverflow="hidden" />
              ))}
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                domain={[0, Math.ceil(yMax / 50) * 50]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                name="AQI"
                stroke={lineColor}
                strokeWidth={2.5}
                fill="url(#histFill)"
                dot={false}
                activeDot={{ r: 4, fill: lineColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.section>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  sub?: string;
  tone: "neutral" | "good" | "bad";
}) {
  const color =
    tone === "bad" ? "hsl(16 100% 50%)" : tone === "good" ? "hsl(142 58% 36%)" : "hsl(201 100% 14%)";
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">{label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span
          className="leading-none tabular-nums"
          style={{ fontFamily: "var(--font-sans)", fontSize: "1.5rem", fontWeight: 700, color }}
        >
          {value}
        </span>
        {sub && <span className="text-[10px] text-muted-foreground font-medium">{sub}</span>}
      </div>
    </div>
  );
}

export default HistoricalAnalysis;
