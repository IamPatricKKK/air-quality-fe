import { motion } from 'framer-motion';
import { Station, getAQILevel, getAQILabel, getAQIColorClass, getAQIBgClass } from '@/data/mockData';
import { Activity } from 'lucide-react';

interface StationDetailProps {
  station: Station;
}

const pollutants = [
  { key: 'pm25' as const, label: 'PM2.5', unit: 'µg/m³', safe: 35 },
  { key: 'pm10' as const, label: 'PM10', unit: 'µg/m³', safe: 50 },
  { key: 'o3' as const, label: 'O₃', unit: 'ppb', safe: 70 },
  { key: 'no2' as const, label: 'NO₂', unit: 'ppb', safe: 53 },
  { key: 'so2' as const, label: 'SO₂', unit: 'ppb', safe: 35 },
  { key: 'co' as const, label: 'CO', unit: 'ppm', safe: 4.4 },
];

export function StationDetail({ station }: StationDetailProps) {
  const level = getAQILevel(station.aqi);
  const colorClass = getAQIColorClass(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className={`w-4 h-4 ${colorClass}`} />
        <h2 className="text-sm font-semibold font-display text-foreground">
          Thông số chi tiết
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {pollutants.map((p) => {
          const value = station[p.key];
          const ratio = Math.min(value / (p.safe * 2), 1);
          const barColor = ratio < 0.35 ? 'bg-aqi-good' : ratio < 0.7 ? 'bg-aqi-moderate' : 'bg-aqi-unhealthy';

          return (
            <div key={p.key} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-muted-foreground">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.unit}</span>
              </div>
              <div className="text-lg font-bold font-display text-foreground">{value}</div>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ratio * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className={`h-full rounded-full ${barColor}`}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">0</span>
                <span className="text-[9px] text-muted-foreground">Ngưỡng: {p.safe}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
