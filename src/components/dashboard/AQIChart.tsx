import { motion } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { Station } from '@/data/mockData';
import { useStationHistory } from '@/hooks/useStations';
import { aqiReferenceLines } from '@/lib/aqi';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface AQIChartProps {
  station: Station;
}

export function AQIChart({ station }: AQIChartProps) {
  const { data: history, isLoading } = useStationHistory(station.id, 24);

  const chartData = (history ?? []).map((r) => ({
    time: format(new Date(r.recorded_at), 'HH:mm'),
    aqi: r.aqi,
    pm25: r.pm25 ?? 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-4"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold font-display text-foreground">
          Diễn biến AQI - {station.name}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">24 giờ qua</p>
      </div>

      <div className="h-52">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-xs">Đang tải dữ liệu...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
            Chưa có dữ liệu lịch sử cho trạm này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168 70% 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(168 70% 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(200 70% 55%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(200 70% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
              <XAxis
                dataKey="time"
                tick={{ fill: 'hsl(215 12% 55%)', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(220 14% 18%)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'hsl(215 12% 55%)', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(220 14% 18%)' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(220 18% 10%)',
                  border: '1px solid hsl(220 14% 18%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(210 20% 92%)',
                }}
              />
              {aqiReferenceLines().map((r) => (
                <ReferenceLine
                  key={r.y}
                  y={r.y}
                  stroke={r.color}
                  strokeDasharray="2 4"
                  strokeOpacity={0.45}
                  label={{ value: r.label, position: 'right', fontSize: 9, fill: r.color }}
                />
              ))}
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="hsl(168 70% 45%)"
                fill="url(#aqiGrad)"
                strokeWidth={2}
                name="AQI"
              />
              <Area
                type="monotone"
                dataKey="pm25"
                stroke="hsl(200 70% 55%)"
                fill="url(#pm25Grad)"
                strokeWidth={1.5}
                name="PM2.5"
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> AQI</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[hsl(200,70%,55%)] inline-block" /> PM2.5</span>
        <span className="text-muted-foreground">Ngưỡng: <span className="aqi-good">0-50</span> · <span className="aqi-moderate">51-100</span> · <span className="aqi-unhealthy-sensitive">101-150</span> · <span className="aqi-unhealthy">151+</span></span>
      </div>
    </motion.div>
  );
}
