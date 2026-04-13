import { useState } from 'react';
import { Search, MapPin, Wind, Droplets, Thermometer } from 'lucide-react';
import { Station, getAQILevel, getAQILabel, getAQIColorClass, getAQIBgClass } from '@/data/mockData';
import { motion } from 'framer-motion';

interface MobileSearchViewProps {
  stations: Station[];
  onSelectStation: (station: Station) => void;
}

export function MobileSearchView({ stations, onSelectStation }: MobileSearchViewProps) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? stations.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.region.toLowerCase().includes(query.toLowerCase())
      )
    : stations;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm trạm, thành phố, khu vực..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          autoFocus
        />
      </div>

      <p className="text-xs text-muted-foreground px-1">
        {filtered.length} trạm {query ? 'tìm thấy' : 'đang hoạt động'}
      </p>

      <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pb-4">
        {filtered.map((station, i) => {
          const level = getAQILevel(station.aqi);
          const colorClass = getAQIColorClass(level);
          const bgClass = getAQIBgClass(level);

          return (
            <motion.button
              key={station.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelectStation(station)}
              className="w-full glass-card p-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${bgClass}/20 flex flex-col items-center justify-center flex-shrink-0`}>
                  <span className={`text-lg font-bold font-display ${colorClass}`}>{station.aqi}</span>
                  <span className={`text-[8px] font-medium ${colorClass}`}>AQI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{station.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{station.region}</span>
                  </div>
                  <p className={`text-xs font-medium ${colorClass} mt-1`}>{getAQILabel(level)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    <span>{station.pm25}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    <span>{station.temperature}°</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    <span>{station.humidity}%</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
