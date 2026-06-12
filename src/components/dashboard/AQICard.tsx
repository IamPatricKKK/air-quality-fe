import { motion } from 'framer-motion';
import { getAQILevel, getAQILabel } from '@/data/mockData';
import { getAQIColors } from '@/utils/aqi';
import { Pin, GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { StationWithReading } from '@/types';

interface AQICardProps {
  station: StationWithReading;
  onClick: (station: StationWithReading) => void;
  index: number;
  isPinned?: boolean;
  onTogglePin?: (stationId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (stationId: string) => void;
}

export function AQICard({
  station,
  onClick,
  index,
  isPinned,
  onTogglePin,
  isCompared,
  onToggleCompare,
}: AQICardProps) {
  const level = getAQILevel(station.aqi);
  const { solid, tint } = getAQIColors(level);

  /* Stable pseudo-trend from station id */
  const seed = station.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  const trend = seed === 0 ? 'up' : seed === 1 ? 'down' : 'stable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onClick(station)}
      className={[
        'ow-card relative overflow-hidden cursor-pointer group h-full flex flex-col',
        'transition-all duration-200 hover:-translate-y-0.5',
        'hover:border-border',
        isPinned ? 'ring-1 ring-primary/25 ring-offset-0' : '',
        isCompared ? 'ring-1 ring-offset-0' : '',
      ].join(' ')}
      style={isCompared ? { '--tw-ring-color': 'hsl(16 100% 55% / 0.45)' } as React.CSSProperties : undefined}
    >
      {/* Top AQI color accent bar */}
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: solid }}
      />

      {/* Card body */}
      <div className="p-4 pt-5 flex flex-col flex-1">

        {/* Header row: name + actions */}
        <div className="flex items-start justify-between gap-2 min-h-[20px]">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1 flex-1 leading-snug">
            {station.name}
          </h3>
          <div className="flex-shrink-0 flex items-center">
            {/* Trend — hidden on hover */}
            <span className="flex items-center group-hover:hidden">
              {trend === 'up'     && <TrendingUp   className="w-3.5 h-3.5 text-destructive/70" />}
              {trend === 'down'   && <TrendingDown className="w-3.5 h-3.5" style={{ color: 'hsl(142 58% 40%)' }} />}
              {trend === 'stable' && <Minus        className="w-3.5 h-3.5 text-muted-foreground/60" />}
            </span>
            {/* Actions — appear on hover */}
            <span className="hidden group-hover:flex items-center gap-1">
              {onToggleCompare && (
                <button
                  onClick={e => { e.stopPropagation(); onToggleCompare(station.id); }}
                  className={`p-1 rounded-md transition-all ${isCompared ? 'bg-[hsl(16_100%_55%/0.12)]' : 'text-muted-foreground hover:text-foreground'}`}
                  style={isCompared ? { color: 'hsl(16 100% 48%)' } : undefined}
                  title={isCompared ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                </button>
              )}
              {onTogglePin && (
                <button
                  onClick={e => { e.stopPropagation(); onTogglePin(station.id); }}
                  className={`p-1 rounded-md transition-all ${isPinned ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                  title={isPinned ? 'Bỏ ghim' : 'Ghim trạm'}
                >
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                </button>
              )}
            </span>
          </div>
        </div>

        {/* Location — always reserve one line so AQI blocks stay aligned across cards */}
        <p className="mt-1 min-h-[16px] text-[11px] text-muted-foreground/80 line-clamp-1">{station.region || ' '}</p>

        {/* AQI number — dominant focal point */}
        <div className="mt-3.5 flex items-end justify-between gap-2">
          <div>
            <p className="section-label mb-1">AQI</p>
            <div
              className="leading-none font-bold"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '2.75rem',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                color: solid,
              }}
            >
              {station.aqi}
            </div>
          </div>
          <span
            className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-semibold leading-none mb-1"
            style={{ background: tint, color: solid }}
          >
            {getAQILabel(level)}
          </span>
        </div>

        {/* Secondary metrics — anchored to the bottom so rows align across cards */}
        <div className="mt-auto pt-3 border-t border-border/50 grid grid-cols-3 gap-0">
          <div>
            <p className="text-[10px] text-muted-foreground/80">PM2.5</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground font-mono">{station.pm25}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground/80">Nhiệt độ</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{station.temperature}°</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground/80">Độ ẩm</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{station.humidity}%</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
