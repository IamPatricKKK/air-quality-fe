import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import { format, startOfDay, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { useStationHistory } from "@/hooks/useStations";
import { getAqiCategory } from "@/lib/aqi";

interface AQICalendarProps {
  stationId: string;
  days?: number;
}

interface DayCell {
  date: Date;
  key: string;
  avgAqi: number | null;
  samples: number;
}

function buildDayBuckets(days: number): Map<string, DayCell> {
  const today = startOfDay(new Date());
  const buckets = new Map<string, DayCell>();
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, "yyyy-MM-dd");
    buckets.set(key, { date: d, key, avgAqi: null, samples: 0 });
  }
  return buckets;
}

export function AQICalendar({ stationId, days = 30 }: AQICalendarProps) {
  const { data: history, isLoading } = useStationHistory(stationId, days * 24);

  const cells = useMemo<DayCell[]>(() => {
    const buckets = buildDayBuckets(days);

    for (const point of history ?? []) {
      const key = format(new Date(point.recorded_at), "yyyy-MM-dd");
      const bucket = buckets.get(key);
      if (!bucket) continue;
      const sumSoFar = (bucket.avgAqi ?? 0) * bucket.samples + (point.aqi ?? 0);
      bucket.samples += 1;
      bucket.avgAqi = sumSoFar / bucket.samples;
    }

    return Array.from(buckets.values()).map((b) => ({
      ...b,
      avgAqi: b.avgAqi !== null ? Math.round(b.avgAqi) : null,
    }));
  }, [history, days]);

  const stats = useMemo(() => {
    const valid = cells.filter((c) => c.avgAqi !== null) as Array<DayCell & { avgAqi: number }>;
    if (!valid.length) return null;
    const avg = Math.round(valid.reduce((s, c) => s + c.avgAqi, 0) / valid.length);
    const worst = valid.reduce((a, b) => (a.avgAqi > b.avgAqi ? a : b));
    const best = valid.reduce((a, b) => (a.avgAqi < b.avgAqi ? a : b));
    const unhealthyDays = valid.filter((c) => c.avgAqi > 100).length;
    return { avg, worst, best, unhealthyDays, totalDays: valid.length };
  }, [cells]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold font-display text-foreground">
          Lịch AQI {days} ngày qua
        </h2>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <div className="max-w-md mx-auto grid grid-cols-7 gap-1 text-[9px]">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
              <div key={d} className="text-center text-muted-foreground font-medium pb-0.5">
                {d}
              </div>
            ))}

            {(() => {
              // Pad the start so the first day aligns with its weekday column.
              const firstDay = cells[0]?.date;
              const offset = firstDay ? firstDay.getDay() : 0;
              const pads = Array.from({ length: offset }, (_, i) => (
                <div key={`pad-${i}`} />
              ));
              const dayCells = cells.map((cell) => {
                const cat = getAqiCategory(cell.avgAqi);
                const hasData = cell.avgAqi !== null;
                return (
                  <div
                    key={cell.key}
                    title={
                      hasData
                        ? `${format(cell.date, "EEEE dd/MM/yyyy", { locale: vi })} — AQI ${cell.avgAqi} (${cat.label})`
                        : `${format(cell.date, "EEEE dd/MM/yyyy", { locale: vi })} — chưa có dữ liệu`
                    }
                    className="aspect-square rounded flex items-center justify-center text-[9px] font-semibold cursor-default hover:ring-2 hover:ring-primary/40 transition-all"
                    style={{
                      backgroundColor: hasData ? cat.color : "hsl(var(--secondary))",
                      color: hasData ? cat.textColor : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {hasData ? cell.avgAqi : format(cell.date, "d")}
                  </div>
                );
              });
              return [...pads, ...dayCells];
            })()}
          </div>

          {stats && (
            <div className="mt-3 max-w-md mx-auto grid grid-cols-4 gap-1.5 text-[10px]">
              <div className="rounded bg-secondary/50 px-1.5 py-1">
                <p className="text-muted-foreground">AQI TB</p>
                <p className="text-foreground font-bold text-xs">{stats.avg}</p>
              </div>
              <div className="rounded bg-secondary/50 px-1.5 py-1">
                <p className="text-muted-foreground">Tệ nhất</p>
                <p className="text-foreground font-bold text-xs">
                  {stats.worst.avgAqi} <span className="text-[9px] text-muted-foreground">({format(stats.worst.date, "dd/MM")})</span>
                </p>
              </div>
              <div className="rounded bg-secondary/50 px-1.5 py-1">
                <p className="text-muted-foreground">Tốt nhất</p>
                <p className="text-foreground font-bold text-xs">
                  {stats.best.avgAqi} <span className="text-[9px] text-muted-foreground">({format(stats.best.date, "dd/MM")})</span>
                </p>
              </div>
              <div className="rounded bg-secondary/50 px-1.5 py-1">
                <p className="text-muted-foreground">Vượt ngưỡng</p>
                <p className="text-foreground font-bold text-xs">
                  {stats.unhealthyDays}<span className="text-[9px] text-muted-foreground"> / {stats.totalDays}</span>
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
