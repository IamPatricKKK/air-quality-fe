import { motion } from 'framer-motion';
import { Station, getAQILevel, getAQILabel, getAQIColorClass, getAQIBgClass } from '@/data/mockData';
import { MapPin, Thermometer, Droplets, Pin, GitCompare } from 'lucide-react';

interface AQICardProps {
  station: Station;
  onClick: (station: Station) => void;
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
  const colorClass = getAQIColorClass(level);
  const bgClass = getAQIBgClass(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(station)}
      className={`ow-card p-4 pt-0 cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 transition-all group relative ${isPinned ? 'ring-1 ring-primary/30' : ''} ${isCompared ? 'ring-1 ring-orange-500/50' : ''}`}
    >
      {/* Buttons top-right */}
      <div className="flex justify-end gap-1 mt-1">
        {onToggleCompare && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(station.id); }}
            className={`p-1 rounded-md transition-all ${
              isCompared
                ? 'text-orange-400 bg-orange-500/10'
                : 'text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100'
            }`}
            title={isCompared ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
        )}
        {onTogglePin && (
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(station.id); }}
            className={`p-1 rounded-md transition-all ${
              isPinned
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100'
            }`}
            title={isPinned ? 'Bỏ ghim' : 'Ghim trạm'}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Name full width */}
      <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{station.name}</h3>

      {/* Region + AQI */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-muted-foreground min-w-0 flex-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs line-clamp-1">{station.region}</span>
        </div>
        <div className={`flex items-baseline gap-1 flex-shrink-0 ml-2`}>
          <span className={`text-xl font-bold font-display ${colorClass}`}>{station.aqi}</span>
          <span className={`text-[9px] font-medium ${colorClass}`}>AQI</span>
        </div>
      </div>

      <div className={`text-xs font-medium ${colorClass} mb-3`}>
        {getAQILabel(level)}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium text-foreground">{station.pm25}</span>
          <span>PM2.5</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Thermometer className="w-3 h-3" />
          <span>{station.temperature}°C</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Droplets className="w-3 h-3" />
          <span>{station.humidity}%</span>
        </div>
      </div>
    </motion.div>
  );
}
