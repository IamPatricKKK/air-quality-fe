import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { getLatestForecast } from "@/api/analytics";
import { aqiColors, aqiLabel, AQI_BANDS } from "./stationInsights";
import SegmentedControl from "./SegmentedControl";

interface Props {
  stationId: string;
}

const HORIZONS = [
  { value: "6", label: "6 giờ" },
  { value: "12", label: "12 giờ" },
  { value: "24", label: "24 giờ" },
  { value: "48", label: "48 giờ" },
] as const;

type Horizon = (typeof HORIZONS)[number]["value"];

interface ChartPoint {
  ts: number;
  time: string;
  predicted: number;
  range: [number, number];
}

export function ForecastPanel({ stationId }: Props) {
  const [horizon, setHorizon] = useState<Horizon>("24");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["forecast-latest", stationId, "aqi"],
    queryFn: () => getLatestForecast(stationId, "aqi"),
    enabled: Boolean(stationId),
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });

  const allPoints = useMemo<ChartPoint[]>(() => {
    if (!data?.points) return [];
    return data.points
      .map((p) => {
        const ts = new Date(p.predictedAt).getTime();
        const predicted = Math.round(p.predictedValue);
        const lower = p.lowerBound ?? p.predictedValue;
        const upper = p.upperBound ?? p.predictedValue;
        return {
          ts,
          time: format(new Date(p.predictedAt), "HH:mm"),
          predicted,
          range: [Math.round(lower), Math.round(upper)] as [number, number],
        };
      })
      .sort((a, b) => a.ts - b.ts);
  }, [data]);

  const points = useMemo(() => {
    if (allPoints.length === 0) return [];
    const start = allPoints[0].ts;
    const cutoff = start + Number(horizon) * 3_600_000;
    const filtered = allPoints.filter((p) => p.ts <= cutoff);
    return filtered.length > 1 ? filtered : allPoints.slice(0, 2);
  }, [allPoints, horizon]);

  if (isLoading) {
    return (
      <div className="ow-card p-6 flex items-center justify-center h-56 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-sm">Đang tải dự báo Prophet…</span>
      </div>
    );
  }
  if (isError || allPoints.length === 0) return null;

  const yMax = Math.max(...points.map((p) => p.range[1]), 60);
  const peak = points.reduce((a, b) => (b.predicted > a.predicted ? b : a), points[0]);
  const peakColors = aqiColors(peak.predicted);
  const endValue = points[points.length - 1]?.predicted ?? peak.predicted;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="ow-card p-5 md:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Dự báo chất lượng không khí
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mô hình Prophet · cập nhật {data?.run.finishedAt ? format(new Date(data.run.finishedAt), "HH:mm dd/MM") : "—"}
            {data?.run.mae != null && ` · MAE ${data.run.mae.toFixed(1)}`}
          </p>
        </div>
        <SegmentedControl options={HORIZONS} value={horizon} onChange={setHorizon} layoutId="forecast-horizon" />
      </div>

      {/* Peak summary */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-baseline gap-2">
          <span className="section-label">Đỉnh dự báo</span>
          <span
            className="leading-none tabular-nums"
            style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 800, color: peakColors.solid }}
          >
            {peak.predicted}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: peakColors.tint, color: peakColors.solid }}
          >
            {aqiLabel(peak.predicted)}
          </span>
          <span className="text-xs text-muted-foreground">lúc {peak.time}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5" />
          Kết thúc kỳ: <span className="font-semibold text-foreground tabular-nums">{endValue}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="fcLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(201 100% 14%)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="hsl(201 100% 14%)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* AQI category zones */}
            {AQI_BANDS.filter((b) => b.y1 < yMax).map((b) => (
              <ReferenceArea
                key={b.level}
                y1={b.y1}
                y2={b.y2}
                fill={b.color}
                fillOpacity={0.06}
                stroke="none"
                ifOverflow="hidden"
              />
            ))}

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
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
              formatter={(value: number | number[], name) => {
                if (name === "Khoảng tin cậy" && Array.isArray(value)) {
                  return [`${value[0]} – ${value[1]}`, name];
                }
                return [value as number, name];
              }}
            />

            {/* Confidence interval band */}
            <Area
              type="monotone"
              dataKey="range"
              name="Khoảng tin cậy"
              stroke="none"
              fill="hsl(203 39% 57%)"
              fillOpacity={0.16}
              isAnimationActive={false}
              activeDot={false}
            />
            {/* Forecast curve */}
            <Area
              type="monotone"
              dataKey="predicted"
              name="Dự báo AQI"
              stroke="hsl(201 100% 14%)"
              strokeWidth={2.5}
              fill="url(#fcLine)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(201 100% 14%)" }}
            />
            <ReferenceLine y={100} stroke="hsl(16 100% 50%)" strokeDasharray="4 4" strokeOpacity={0.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-0.5 bg-primary inline-block rounded" /> Đường dự báo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 inline-block rounded-sm" style={{ background: "hsl(203 39% 57% / 0.3)" }} /> Khoảng tin cậy
        </span>
        <span>Dải màu nền = ngưỡng AQI</span>
      </div>
    </motion.section>
  );
}

export default ForecastPanel;
