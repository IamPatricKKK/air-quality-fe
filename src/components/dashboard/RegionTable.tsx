import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Station, getAQILevel, getAQILabel } from '@/data/mockData';
import { getAQIColors } from '@/utils/aqi';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ChevronDown } from 'lucide-react';

interface RegionTableProps {
  stations?: Station[];
}

type SortKey = 'aqi' | 'pm25' | 'name' | 'region' | 'temperature' | 'humidity';
type SortDir = 'asc' | 'desc';

export function RegionTable({ stations = [] }: RegionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('aqi');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [collapsed, setCollapsed] = useState(false);

  const regions = useMemo(() => {
    const r = [...new Set(stations.map(s => s.region))].sort();
    return r;
  }, [stations]);

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
      let va: any, vb: any;
      switch (sortKey) {
        case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
        case 'region': va = a.region.toLowerCase(); vb = b.region.toLowerCase(); break;
        default: va = (a as any)[sortKey] ?? 0; vb = (b as any)[sortKey] ?? 0;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
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
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-primary" />
      : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  if (stations.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center text-muted-foreground text-sm">
        Chưa có dữ liệu trạm
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="ow-card overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div>
          <h2 className="text-lg md:text-xl font-bold font-display text-foreground">Xếp hạng khu vực</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Sắp xếp theo {sortKey === 'aqi' ? 'AQI' : sortKey === 'pm25' ? 'PM2.5' : sortKey === 'name' ? 'Tên' : sortKey === 'region' ? 'Khu vực' : sortKey === 'temperature' ? 'Nhiệt độ' : 'Độ ẩm'} {sortDir === 'desc' ? 'giảm dần' : 'tăng dần'}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Filters */}
      <div className={`px-4 py-2 border-b border-border/30 flex flex-col sm:flex-row gap-2 ${collapsed ? 'hidden' : ''}`}>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm trạm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-secondary rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="pl-8 pr-6 py-1.5 bg-secondary rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="all">Tất cả khu vực</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className={`overflow-x-auto ${collapsed ? 'hidden' : ''}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border/50 bg-secondary/30">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">#</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('name')}>
                <span className="flex items-center gap-1">Trạm <SortIcon col="name" /></span>
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('region')}>
                <span className="flex items-center gap-1">Khu vực <SortIcon col="region" /></span>
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('aqi')}>
                <span className="flex items-center gap-1">AQI <SortIcon col="aqi" /></span>
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('pm25')}>
                <span className="flex items-center justify-end gap-1">PM2.5 <SortIcon col="pm25" /></span>
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell cursor-pointer select-none" onClick={() => handleSort('temperature')}>
                <span className="flex items-center justify-end gap-1">Nhiệt độ <SortIcon col="temperature" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((station, i) => {
              const level = getAQILevel(station.aqi);
              const { solid, tint } = getAQIColors(level);

              return (
                <tr key={station.id} className="border-b border-border/30 last:border-b-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground font-medium">{i + 1}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground max-w-[220px] truncate">
                    <Link to={`/stations/${station.id}`} className="hover:text-primary hover:underline">
                      {station.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{station.region}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex min-w-[44px] justify-center px-2.5 py-1 rounded-full font-bold text-white"
                      style={{ backgroundColor: solid }}
                    >
                      {station.aqi}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: solid }}>
                    {getAQILabel(level)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-foreground">{station.pm25}</td>
                  <td className="px-5 py-3.5 text-right text-muted-foreground hidden md:table-cell">{station.temperature}°C</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-muted-foreground">
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
