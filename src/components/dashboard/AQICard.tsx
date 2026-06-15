import { motion } from 'framer-motion';
import { Station, getAQILevel, getAQILabel } from '@/data/mockData';
import { getAQIColors } from '@/utils/aqi';
import { MapPin, Thermometer, Droplets, Pin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AQICardProps {
  station: Station;
  onClick: (station: Station) => void;
  index: number;
  isPinned?: boolean;
  onTogglePin?: (stationId: string) => void;
}

export function AQICard({
  station,
  onClick,
  index,
  isPinned,
  onTogglePin,
}: AQICardProps) {
  const level = getAQILevel(station.aqi);
  const { solid, tint } = getAQIColors(level);
  // Stable pseudo-trend derived from the station id (independent of list position)
  const trendSeed = station.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 3;
  const trend = trendSeed === 0 ? 'up' : trendSeed === 1 ? 'down' : 'stable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(station)}
      className={`ow-card relative overflow-hidden p-4 pt-5 cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 transition-all group ${isPinned ? 'ring-1 ring-primary/30' : ''}`}
    >
      {/* Colored top accent */}
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: solid }} />

      {/* Header: name + trend / actions */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1 flex-1">{station.name}</h3>
        <div className="flex-shrink-0">
          {/* Trend indicator (hidden on hover to reveal actions) */}
          <span className="flex items-center group-hover:hidden">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-destructive" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-emerald-500" />}
            {trend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
          </span>
          {/* Pin action on hover */}
          <span className="hidden group-hover:flex items-center gap-1">
            {onTogglePin && (
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePin(station.id); }}
                className={`p-1 rounded-md transition-all ${isPinned ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                title={isPinned ? 'Bỏ ghim' : 'Ghim trạm'}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="mt-1 flex items-center gap-1 text-muted-foreground">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="text-xs line-clamp-1">{station.region}</span>
      </div>

      {/* AQI value + status pill */}
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">AQI</p>
          <div className="text-3xl font-bold font-display leading-none" style={{ color: solid }}>
            {station.aqi}
          </div>
        </div>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-tight text-right"
          style={{ backgroundColor: tint, color: solid }}
        >
          {getAQILabel(level)}
        </span>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-border/50" />

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-[10px] text-muted-foreground">PM2.5</p>
          <p className="font-semibold text-foreground">{station.pm25}</p>
        </div>
        <div className="flex flex-col items-center">
          <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="mt-0.5 font-medium text-foreground">{station.temperature}°</p>
        </div>
        <div className="flex flex-col items-center">
          <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="mt-0.5 font-medium text-foreground">{station.humidity}%</p>
        </div>
      </div>
    </motion.div>
  );
}
