import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, X, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw,
  MapPin, SlidersHorizontal, Wifi,
} from 'lucide-react';
import { getAQILevel, getAQILabel, getAQIColors, type AQILevel } from '@/utils/aqi';
import type { StationWithReading } from '@/types';
import { MEDALS, AqiBadge, StatusBadge } from './aqiVisuals';

interface RankingBoardProps {
  stations: StationWithReading[];
}

type SortKey = 'aqi' | 'pm25' | 'name' | 'region' | 'temperature';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

const AQI_LEVELS: AQILevel[] = ['good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'very-unhealthy', 'hazardous'];

const ACCENT = 'hsl(201 100% 22%)';

/** Styled native <select> — accessible, keyboard-friendly, themed to the toolbar. */
function FilterSelect({
  icon: Icon, value, onChange, children, title,
}: {
  icon: typeof MapPin;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      <select
        title={title}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-border/60 bg-card/80 pl-8 pr-7 text-xs font-medium text-foreground cursor-pointer transition-colors hover:border-border focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        {children}
      </select>
      <ArrowDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
    </div>
  );
}

export function RankingBoard({ stations }: RankingBoardProps) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<AQILevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('aqi');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const regions = useMemo(() => [...new Set(stations.map((s) => s.region))].sort(), [stations]);

  const filtered = useMemo(() => {
    let result = [...stations];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q));
    }
    if (regionFilter !== 'all') result = result.filter((s) => s.region === regionFilter);
    if (categoryFilter !== 'all') result = result.filter((s) => getAQILevel(s.aqi) === categoryFilter);
    if (statusFilter !== 'all') result = result.filter((s) => (statusFilter === 'active' ? s.is_active : !s.is_active));

    result.sort((a, b) => {
      let va: string | number, vb: string | number;
      switch (sortKey) {
        case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
        case 'region': va = a.region.toLowerCase(); vb = b.region.toLowerCase(); break;
        default: va = a[sortKey]; vb = b[sortKey];
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [stations, search, regionFilter, categoryFilter, statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'region' ? 'asc' : 'desc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setRegionFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilter =
    search.trim() !== '' || regionFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all';

  const isPollutionRank = sortKey === 'aqi' && sortDir === 'desc';

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3" style={{ color: ACCENT }} />
      : <ArrowDown className="w-3 h-3" style={{ color: ACCENT }} />;
  };

  return (
    <section className="space-y-3">
      {/* ─── SECTION 3 · STICKY FILTER TOOLBAR ─────────────────────── */}
      <div className="sticky top-[52px] lg:top-[80px] z-30 glass-card px-3 py-2.5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo tên trạm hoặc khu vực..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border/60 bg-card/80 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground transition-colors hover:border-border focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Xoá tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:flex lg:items-center">
            <FilterSelect icon={MapPin} value={regionFilter} onChange={setRegionFilter} title="Lọc theo khu vực">
              <option value="all">Tất cả khu vực</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </FilterSelect>

            <FilterSelect
              icon={SlidersHorizontal}
              value={categoryFilter}
              onChange={(v) => setCategoryFilter(v as AQILevel | 'all')}
              title="Lọc theo mức AQI"
            >
              <option value="all">Tất cả mức AQI</option>
              {AQI_LEVELS.map((lv) => <option key={lv} value={lv}>{getAQILabel(lv)}</option>)}
            </FilterSelect>

            <FilterSelect
              icon={Wifi}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              title="Lọc theo trạng thái trạm"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngưng hoạt động</option>
            </FilterSelect>

            <button
              onClick={resetFilters}
              disabled={!hasActiveFilter}
              className="col-span-2 sm:col-span-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-card/80 px-3 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* ─── SECTION 4/5 · DATA TABLE ──────────────────────────────── */}
      <div className="ow-card overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/50">
          <div>
            <h2 className="text-base font-semibold leading-tight text-foreground">Bảng xếp hạng chi tiết</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} / {stations.length} trạm · sắp xếp theo{' '}
              {sortKey === 'aqi' ? 'AQI' : sortKey === 'pm25' ? 'PM2.5' : sortKey === 'name' ? 'tên' : sortKey === 'region' ? 'khu vực' : 'nhiệt độ'}
              {' '}{sortDir === 'desc' ? '↓' : '↑'}
            </p>
          </div>
        </div>

        {/* Scroll area with sticky header */}
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="sticky top-0 z-10">
                {[
                  { node: <span className="section-label">#</span>, cls: 'w-12 text-left' },
                  { node: <button onClick={() => handleSort('aqi')} className="section-label inline-flex items-center gap-1 hover:text-foreground transition-colors">AQI <SortIcon col="aqi" /></button>, cls: 'w-24 text-left' },
                  { node: <button onClick={() => handleSort('name')} className="section-label inline-flex items-center gap-1 hover:text-foreground transition-colors">Trạm <SortIcon col="name" /></button>, cls: 'text-left' },
                  { node: <button onClick={() => handleSort('region')} className="section-label inline-flex items-center gap-1 hover:text-foreground transition-colors">Khu vực <SortIcon col="region" /></button>, cls: 'text-left hidden sm:table-cell' },
                  { node: <span className="section-label">Trạng thái</span>, cls: 'text-left' },
                  { node: <button onClick={() => handleSort('pm25')} className="section-label inline-flex items-center justify-end gap-1 w-full hover:text-foreground transition-colors">PM2.5 <SortIcon col="pm25" /></button>, cls: 'text-right hidden md:table-cell' },
                  { node: <button onClick={() => handleSort('temperature')} className="section-label inline-flex items-center justify-end gap-1 w-full hover:text-foreground transition-colors">Nhiệt độ <SortIcon col="temperature" /></button>, cls: 'text-right hidden lg:table-cell' },
                ].map((col, i) => (
                  <th
                    key={i}
                    className={`bg-secondary border-b border-border/60 px-4 py-2.5 ${col.cls}`}
                  >
                    {col.node}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((station, i) => {
                const { solid } = getAQIColors(getAQILevel(station.aqi));
                const selected = selectedId === station.id;
                const medal = isPollutionRank && i < 3 ? MEDALS[i] : null;

                return (
                  <motion.tr
                    key={station.id}
                    layout="position"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setSelectedId((cur) => (cur === station.id ? null : station.id))}
                    className="group cursor-pointer transition-colors"
                    style={{ background: selected ? 'hsl(201 100% 14% / 0.05)' : undefined }}
                  >
                    {/* Rank */}
                    <td className="relative border-b border-border/30 px-4 py-2.5 group-hover:bg-secondary/40 transition-colors">
                      {selected && (
                        <span className="absolute inset-y-1 left-0 w-[3px] rounded-full" style={{ background: solid }} />
                      )}
                      {medal ? (
                        <span className="text-base leading-none">{medal.emoji}</span>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
                      )}
                    </td>

                    {/* AQI — strongest visual element */}
                    <td className="border-b border-border/30 px-4 py-2.5 group-hover:bg-secondary/40 transition-colors">
                      <AqiBadge aqi={station.aqi} size="md" />
                    </td>

                    {/* Station */}
                    <td className="border-b border-border/30 px-4 py-2.5 max-w-[240px] group-hover:bg-secondary/40 transition-colors">
                      <Link
                        to={`/stations/${station.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-semibold text-foreground transition-colors hover:text-[hsl(201_100%_22%)] hover:underline"
                      >
                        {station.name}
                      </Link>
                      <span className="sm:hidden text-xs text-muted-foreground">{station.region}</span>
                    </td>

                    {/* Region */}
                    <td className="border-b border-border/30 px-4 py-2.5 text-sm text-muted-foreground hidden sm:table-cell group-hover:bg-secondary/40 transition-colors">
                      {station.region}
                    </td>

                    {/* Status */}
                    <td className="border-b border-border/30 px-4 py-2.5 group-hover:bg-secondary/40 transition-colors">
                      <StatusBadge aqi={station.aqi} />
                    </td>

                    {/* PM2.5 */}
                    <td className="border-b border-border/30 px-4 py-2.5 text-right text-sm font-medium text-foreground tabular-nums hidden md:table-cell group-hover:bg-secondary/40 transition-colors">
                      {station.pm25}
                    </td>

                    {/* Temperature */}
                    <td className="border-b border-border/30 px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums hidden lg:table-cell group-hover:bg-secondary/40 transition-colors">
                      {station.temperature}°C
                    </td>
                  </motion.tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-foreground">Không tìm thấy trạm phù hợp</p>
                    <p className="mt-1 text-xs text-muted-foreground">Thử điều chỉnh bộ lọc hoặc đặt lại tìm kiếm.</p>
                    {hasActiveFilter && (
                      <button
                        onClick={resetFilters}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Đặt lại bộ lọc
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
