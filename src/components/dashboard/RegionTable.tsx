import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAQILevel, getAQILabel } from '@/data/mockData';
import { getAQIColors } from '@/utils/aqi';
import type { StationWithReading } from '@/types';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ChevronDown } from 'lucide-react';

interface RegionTableProps {
  stations?: StationWithReading[];
}

type SortKey = 'aqi' | 'pm25' | 'name' | 'region' | 'temperature' | 'humidity';
type SortDir = 'asc' | 'desc';

export function RegionTable({ stations = [] }: RegionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('aqi');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [collapsed, setCollapsed] = useState(false);

  const regions = useMemo(() => [...new Set(stations.map(s => s.region))].sort(), [stations]);

  const filtered = useMemo(() => {
    let result = [...stations];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q));
    }
    if (regionFilter !== 'all') {
      result = result.filter(s => s.region === regionFilter);
    }
    result.sort((a, b) => {
      let va: string | number, vb: string | number;
      switch (sortKey) {
        case 'name':   va = a.name.toLowerCase();   vb = b.name.toLowerCase();   break;
        case 'region': va = a.region.toLowerCase(); vb = b.region.toLowerCase(); break;
        default: va = (a as Record<string, number>)[sortKey] ?? 0; vb = (b as Record<string, number>)[sortKey] ?? 0;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return result;
  }, [stations, search, regionFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'region' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />;
    return sortDir === 'asc'
      ? <ArrowUp   className="w-3 h-3" style={{ color: 'hsl(201 100% 22%)' }} />
      : <ArrowDown className="w-3 h-3" style={{ color: 'hsl(201 100% 22%)' }} />;
  };

  if (stations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center text-muted-foreground text-sm"
      >
        Chưa có dữ liệu trạm
      </motion.div>
    );
  }

  const sortLabel: Record<SortKey, string> = {
    aqi: 'AQI', pm25: 'PM2.5', name: 'Tên', region: 'Khu vực', temperature: 'Nhiệt độ', humidity: 'Độ ẩm',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="ow-card overflow-hidden"
    >
      {/* Section header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
      >
        <div>
          <h2 className="text-base font-semibold leading-tight text-foreground">
            Xếp hạng khu vực
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sắp xếp theo {sortLabel[sortKey]} {sortDir === 'desc' ? '↓ giảm dần' : '↑ tăng dần'}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Filters */}
      <div className={`px-4 py-2.5 border-b border-border/40 flex flex-col sm:flex-row gap-2 ${collapsed ? 'hidden' : ''}`}>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm trạm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-secondary rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="pl-8 pr-6 py-1.5 bg-secondary rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
          >
            <option value="all">Tất cả khu vực</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-auto max-h-[460px] ${collapsed ? 'hidden' : ''}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="sticky top-0 z-10 border-y border-border/40 bg-secondary">
              <th className="px-5 py-3 text-left">
                <span className="section-label">#</span>
              </th>
              <th className="px-5 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('name')}>
                <span className="section-label flex items-center gap-1">Trạm <SortIcon col="name" /></span>
              </th>
              <th className="px-5 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('region')}>
                <span className="section-label flex items-center gap-1">Khu vực <SortIcon col="region" /></span>
              </th>
              <th className="px-5 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('aqi')}>
                <span className="section-label flex items-center gap-1">AQI <SortIcon col="aqi" /></span>
              </th>
              <th className="px-5 py-3 text-left">
                <span className="section-label">Trạng thái</span>
              </th>
              <th className="px-5 py-3 text-right cursor-pointer select-none" onClick={() => handleSort('pm25')}>
                <span className="section-label flex items-center justify-end gap-1">PM2.5 <SortIcon col="pm25" /></span>
              </th>
              <th className="px-5 py-3 text-right hidden md:table-cell cursor-pointer select-none" onClick={() => handleSort('temperature')}>
                <span className="section-label flex items-center justify-end gap-1">Nhiệt độ <SortIcon col="temperature" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((station, i) => {
              const level = getAQILevel(station.aqi);
              const { solid, tint } = getAQIColors(level);

              return (
                <tr
                  key={station.id}
                  className="border-b border-border/30 last:border-b-0 hover:bg-secondary/30 transition-colors duration-100"
                >
                  <td className="px-5 py-3.5 text-xs font-medium text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground max-w-[220px] truncate">
                    <Link
                      to={`/stations/${station.id}`}
                      className="hover:underline transition-colors"
                      style={{ color: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'hsl(201 100% 22%)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                    >
                      {station.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{station.region}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex min-w-[44px] justify-center px-2.5 py-1 rounded-lg font-bold text-white text-sm"
                      style={{
                        background: solid,
                        fontFamily: "'DM Mono', ui-monospace, monospace",
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {station.aqi}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: tint, color: solid }}
                    >
                      {getAQILabel(level)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-foreground tabular-nums font-medium"
                    style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}
                  >
                    {station.pm25}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-muted-foreground hidden md:table-cell tabular-nums">
                    {station.temperature}°C
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Không tìm thấy trạm phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
