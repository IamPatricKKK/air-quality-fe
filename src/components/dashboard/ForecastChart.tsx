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
import { aqiReferenceLines } from "@/lib/aqi";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(215 12% 55%)", fontSize: 9 }}
              axisLine={{ stroke: "hsl(220 14% 18%)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "hsl(215 12% 55%)", fontSize: 10 }}
              axisLine={{ stroke: "hsl(220 14% 18%)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(220 18% 10%)",
                border: "1px solid hsl(220 14% 18%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(210 20% 92%)",
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
