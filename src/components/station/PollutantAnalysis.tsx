import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { FlaskConical, AlertTriangle } from "lucide-react";
import type { StationWithReading } from "@/types";
import { analyzePollutants, SEVERITY_LABEL, type PollutantReading } from "./stationInsights";

interface Props {
  station: StationWithReading;
}

/** Radial gauge for the single most dangerous pollutant. */
function DominantGauge({ reading }: { reading: PollutantReading }) {
  const pct = Math.round(reading.pct);
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-44 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="74%"
            outerRadius="100%"
            data={[{ value: pct, fill: reading.color }]}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <RadialBar
              background={{ fill: reading.tint }}
              dataKey="value"
              cornerRadius={20}
              isAnimationActive
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="leading-none tabular-nums"
            style={{ fontFamily: "var(--font-sans)", fontSize: "2.25rem", fontWeight: 800, color: reading.color }}
          >
            {Math.round(reading.value)}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">{reading.meta.unit}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-bold text-foreground">{reading.meta.label}</p>
        <p className="text-xs text-muted-foreground">{reading.meta.name}</p>
        <span
          className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ background: reading.tint, color: reading.color }}
        >
          {Math.round(reading.ratio * 100)}% ngưỡng · {SEVERITY_LABEL[reading.severity]}
        </span>
      </div>
    </div>
  );
}

function PollutantBar({ reading }: { reading: PollutantReading }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 flex-shrink-0 rounded-full" style={{ background: reading.color }} />
          <span className="text-sm font-semibold text-foreground">{reading.meta.label}</span>
          <span className="text-[11px] text-muted-foreground truncate">{reading.meta.name}</span>
        </div>
        <div className="flex items-baseline gap-1 flex-shrink-0">
          <span className="text-sm font-bold tabular-nums text-foreground">{Math.round(reading.value)}</span>
          <span className="text-[10px] text-muted-foreground">{reading.meta.unit}</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${reading.pct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: reading.color }}
          />
          {/* Threshold marker at 50% (= safe limit on a ×2 scale) */}
          <span className="absolute inset-y-0 left-1/2 w-px bg-foreground/25" />
        </div>
        <span
          className="w-16 text-right text-[11px] font-semibold tabular-nums"
          style={{ color: reading.color }}
        >
          {Math.round(reading.ratio * 100)}%
        </span>
      </div>
    </div>
  );
}

export function PollutantAnalysis({ station }: Props) {
  const readings = analyzePollutants(station);
  const dominant = readings[0];
  const rest = readings.slice(1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="ow-card p-5 md:p-6"
    >
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">Phân tích chất ô nhiễm</h2>
      </div>

      {/* Most dangerous highlight */}
      <div
        className="mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5"
        style={{ background: dominant.tint }}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: dominant.color }} />
        <p className="text-sm" style={{ color: dominant.color }}>
          <span className="font-bold">{dominant.meta.name}</span> đang là chất ô nhiễm đáng lo ngại nhất tại trạm này.
        </p>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <DominantGauge reading={dominant} />

        <div className="space-y-3.5">
          {/* Dominant shown again as a bar for direct comparison */}
          {[dominant, ...rest].map((r) => (
            <PollutantBar key={r.meta.key} reading={r} />
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Thanh đo so với ngưỡng khuyến nghị (vạch giữa = 100% ngưỡng). Giá trị càng vượt vạch, mức độ ô nhiễm càng cao.
      </p>
    </motion.section>
  );
}

export default PollutantAnalysis;
