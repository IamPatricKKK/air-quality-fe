import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { ArrowLeft, X, GitCompare, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { useStations, useStationHistory } from "@/hooks/useStations";
import { useCompareStations } from "@/hooks/useCompareStations";
import { getAqiCategory, aqiReferenceLines } from "@/lib/aqi";
import type { StationHistoryPoint, StationWithReading } from "@/types";

const SERIES_COLORS = ["hsl(168 70% 45%)", "hsl(28 90% 55%)", "hsl(270 70% 60%)"];

interface SeriesPoint {
  time: string;
  [stationId: string]: number | string;
}

function buildMergedSeries(
  stations: StationWithReading[],
  histories: Record<string, StationHistoryPoint[] | undefined>,
): SeriesPoint[] {
  const allTimestamps = new Set<string>();
  for (const station of stations) {
    const points = histories[station.id] ?? [];
    for (const p of points) allTimestamps.add(p.recorded_at);
  }
  const sorted = Array.from(allTimestamps).sort();

  return sorted.map((ts) => {
    const point: SeriesPoint = { time: format(new Date(ts), "HH:mm") };
    for (const station of stations) {
      const match = (histories[station.id] ?? []).find((p) => p.recorded_at === ts);
      if (match) point[station.id] = match.aqi;
    }
    return point;
  });
}

export default function Compare() {
  const { ids, toggle, clear } = useCompareStations();
  const { data: allStations = [] } = useStations();

  const selectedStations = useMemo(
    () => ids.map((id) => allStations.find((s) => s.id === id)).filter(Boolean) as StationWithReading[],
    [ids, allStations],
  );

  const stationA = selectedStations[0];
  const stationB = selectedStations[1];
  const stationC = selectedStations[2];

  const historyA = useStationHistory(stationA?.id, 24);
  const historyB = useStationHistory(stationB?.id, 24);
  const historyC = useStationHistory(stationC?.id, 24);

  const histories = useMemo<Record<string, StationHistoryPoint[] | undefined>>(() => {
    const map: Record<string, StationHistoryPoint[] | undefined> = {};
    if (stationA) map[stationA.id] = historyA.data;
    if (stationB) map[stationB.id] = historyB.data;
    if (stationC) map[stationC.id] = historyC.data;
    return map;
  }, [stationA, stationB, stationC, historyA.data, historyB.data, historyC.data]);

  const chartData = useMemo(
    () => buildMergedSeries(selectedStations, histories),
    [selectedStations, histories],
  );

  const isLoading = [historyA, historyB, historyC].some((q, i) => i < selectedStations.length && q.isLoading);

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <BackButton />
        {ids.length > 0 && (
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Xoá tất cả
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">So sánh trạm</h1>
          <p className="text-xs text-muted-foreground">
            Đối chiếu diễn biến AQI 24h giữa các trạm đã chọn (tối đa 3 trạm).
          </p>
        </div>
      </div>

      {selectedStations.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-3">
          <Info className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-foreground">Chưa có trạm nào để so sánh.</p>
          <p className="text-xs text-muted-foreground">
            Vào dashboard, nhấn nút "So sánh" trên card của trạm bạn quan tâm để thêm vào danh sách này.
          </p>
        </div>
      ) : (
        <>
          {/* Selected stations summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedStations.map((station, i) => {
              const cat = getAqiCategory(station.aqi);
              return (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 relative"
                >
                  <button
                    onClick={() => toggle(station.id)}
                    className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Bỏ khỏi so sánh"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: SERIES_COLORS[i] }}
                    />
                    <h3 className="text-sm font-semibold text-foreground truncate pr-6">
                      {station.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{station.region}</p>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-2xl font-bold font-display" style={{ color: cat.color }}>
                      {station.aqi}
                    </span>
                    <span className="text-xs text-muted-foreground">AQI</span>
                  </div>
                  <div
                    className="text-[11px] font-medium px-2 py-0.5 rounded inline-block mt-1"
                    style={{ backgroundColor: cat.color, color: cat.textColor }}
                  >
                    {cat.labelShort}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">PM2.5</span>
                      <p className="text-foreground font-medium">{station.pm25} µg/m³</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PM10</span>
                      <p className="text-foreground font-medium">{station.pm10} µg/m³</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Overlay chart */}
          <div className="glass-card p-4">
            <h2 className="text-sm font-semibold font-display text-foreground mb-1">
              Diễn biến AQI 24 giờ — so sánh
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Mỗi đường tương ứng một trạm. Đường nét đứt là ngưỡng AQI theo US EPA.
            </p>
            <div className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Đang tải lịch sử 24h...
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Không có dữ liệu lịch sử cho các trạm đã chọn.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "hsl(215 12% 55%)", fontSize: 10 }}
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
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {aqiReferenceLines().map((r) => (
                      <ReferenceLine
                        key={r.y}
                        y={r.y}
                        stroke={r.color}
                        strokeDasharray="2 4"
                        strokeOpacity={0.35}
                      />
                    ))}
                    {selectedStations.map((station, i) => (
                      <Line
                        key={station.id}
                        type="monotone"
                        dataKey={station.id}
                        name={station.name}
                        stroke={SERIES_COLORS[i]}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick stats table */}
          <div className="glass-card p-4">
            <h2 className="text-sm font-semibold font-display text-foreground mb-3">
              Chỉ số hiện tại
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="text-left py-2 pr-4 font-medium">Trạm</th>
                    <th className="text-right py-2 px-2 font-medium">AQI</th>
                    <th className="text-right py-2 px-2 font-medium">PM2.5</th>
                    <th className="text-right py-2 px-2 font-medium">PM10</th>
                    <th className="text-right py-2 px-2 font-medium">O₃</th>
                    <th className="text-right py-2 px-2 font-medium">NO₂</th>
                    <th className="text-right py-2 pl-2 font-medium">Nhiệt độ</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStations.map((s, i) => {
                    const cat = getAqiCategory(s.aqi);
                    return (
                      <tr key={s.id} className="border-b border-border/30 hover:bg-secondary/40">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: SERIES_COLORS[i] }}
                            />
                            <span className="text-foreground font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right font-bold" style={{ color: cat.color }}>
                          {s.aqi}
                        </td>
                        <td className="py-2 px-2 text-right text-foreground">{s.pm25} µg/m³</td>
                        <td className="py-2 px-2 text-right text-foreground">{s.pm10} µg/m³</td>
                        <td className="py-2 px-2 text-right text-foreground">{s.o3 ?? "—"}</td>
                        <td className="py-2 px-2 text-right text-foreground">{s.no2 ?? "—"}</td>
                        <td className="py-2 pl-2 text-right text-foreground">{s.temperature}°C</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
