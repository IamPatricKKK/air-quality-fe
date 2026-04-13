import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Station, getAQILevel, getAQIColorClass } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchStationProps {
  stations: Station[];
  onSelect: (station: Station) => void;
}

export function SearchStation({ stations, onSelect }: SearchStationProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? stations.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.region.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm trạm, khu vực..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          className="w-full pl-9 pr-9 py-2.5 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto"
          >
            {filtered.map((station) => {
              const level = getAQILevel(station.aqi);
              const colorClass = getAQIColorClass(level);
              return (
                <button
                  key={station.id}
                  onClick={() => {
                    onSelect(station);
                    setQuery('');
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/60 transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{station.name}</p>
                    <p className="text-xs text-muted-foreground">{station.region}</p>
                  </div>
                  <span className={`text-sm font-bold font-display ${colorClass}`}>{station.aqi}</span>
                </button>
              );
            })}
          </motion.div>
        )}
        {open && query.trim() && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl p-4 text-center"
          >
            <p className="text-sm text-muted-foreground">Không tìm thấy kết quả</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
