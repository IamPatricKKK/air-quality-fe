import { motion } from 'framer-motion';
import { Station, getAQILevel, getAQILabel, getAQIColorClass, getAQIBgClass } from '@/data/mockData';
import { MapPin, Thermometer, Droplets, Pin } from 'lucide-react';

interface AQICardProps {
  station: Station;
  onClick: (station: Station) => void;
  index: number;
  isPinned?: boolean;
  onTogglePin?: (stationId: string) => void;
}

export function AQICard({ station, onClick, index, isPinned, onTogglePin }: AQICardProps) {
  const level = getAQILevel(station.aqi);
  const colorClass = getAQIColorClass(level);
  const bgClass = getAQIBgClass(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(station)}
      className={`glass-card p-4 cursor-pointer hover:border-primary/30 transition-all group relative ${isPinned ? 'ring-1 ring-primary/30' : ''}`}
    >
      {onTogglePin && (
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(station.id); }}
          className={`absolute top-2 right-2 p-1 rounded-md transition-all z-10 ${
            isPinned
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100'
          }`}
          title={isPinned ? 'Bỏ ghim' : 'Ghim trạm'}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
        </button>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-5">
          <h3 className="text-sm font-semibold text-foreground truncate">{station.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs truncate">{station.region}</span>
          </div>
        </div>
        <div className={`w-14 h-14 rounded-xl ${bgClass}/20 flex flex-col items-center justify-center flex-shrink-0 ml-2`}>
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
