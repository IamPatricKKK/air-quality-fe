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
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { Loader2, Brain } from "lucide-react";
import { getLatestForecast, type ForecastLatest } from "@/api/analytics";
import { aqiReferenceLines, getAqiCategory } from "@/lib/aqi";

interface Props {
  stationId: string;
  metric?: string;
}

export function ForecastChart({ stationId, metric = "aqi" }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["forecast-latest", stationId, metric],
    queryFn: () => getLatestForecast(stationId, metric),
    enabled: Boolean(stationId),
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="glass-card p-4 flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-xs">Đang tải dự báo Prophet...</span>
      </div>
    );
  }

  if (isError || !data || !data.points.length) {
    return null; // Không có forecast thì ẩn, không báo lỗi
  }

  const chartData = data.points.map((p) => ({
    time: format(new Date(p.predictedAt), "dd/MM HH:mm"),
    predicted: p.predictedValue,
    lower: p.lowerBound,
    upper: p.upperBound,
  }));

  const run = data.run;
  const isAqi = metric.toLowerCase() === "aqi";

  // Hourly strip (OpenWeather-style) — first ~12 points
  const hourly = data.points.slice(0, 12).map((p) => {
    const cat = isAqi ? getAqiCategory(p.predictedValue) : null;
    return {
      hour: format(new Date(p.predictedAt), "HH:mm"),
      day: format(new Date(p.predictedAt), "dd/MM"),
      value: Math.round(p.predictedValue),
      color: cat?.color ?? "hsl(var(--primary))",
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ow-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold font-display text-foreground flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-primary" />
            Dự báo {metric.toUpperCase()} — Prophet
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {run.horizonHours}h tới · {run.trainingRows} samples training
          </p>
        </div>
        {run.mae !== null && (
          <div className="text-right text-[10px] text-muted-foreground">
            <span>MAE: {run.mae?.toFixed(1)}</span>
            {run.rmse !== null && <span className="ml-2">RMSE: {run.rmse?.toFixed(1)}</span>}
            {run.mape !== null && <span className="ml-2">MAPE: {run.mape?.toFixed(1)}%</span>}
          </div>
        )}
      </div>

      {/* Hourly forecast strip */}
      {hourly.length > 0 && (
        <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto pb-1.5">
          {hourly.map((h, idx) => (
            <div
              key={idx}
              className="ow-tile flex-shrink-0 w-[58px] !p-2 text-center"
            >
              <div className="text-[10px] text-muted-foreground">{h.hour}</div>
              <div
                className="mx-auto my-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: h.color }}
              />
              <div className="text-sm font-bold font-display text-foreground leading-none">{h.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(260 70% 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(260 70% 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(260 40% 50%)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(260 40% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            {aqiReferenceLines().map((r) => (
              <ReferenceLine
                key={r.y}
                y={r.y}
                stroke={r.color}
                strokeDasharray="2 4"
                strokeOpacity={0.35}
              />
            ))}
            {/* Confidence interval band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#ciGrad)"
              name="Cận trên"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="transparent"
              name="Cận dưới"
            />
            {/* Predicted line */}
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="hsl(260 70% 55%)"
              fill="url(#forecastGrad)"
              strokeWidth={2}
              name="Dự báo"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-[hsl(260,70%,55%)] inline-block" /> Dự báo Prophet
        </span>
        <span>Vùng tím nhạt = khoảng tin cậy</span>
      </div>
    </motion.div>
  );
}

export default ForecastChart;
