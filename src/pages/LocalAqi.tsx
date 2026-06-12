import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Wind,
  AlertTriangle,
  Leaf,
  Building2,
  Layers,
  Filter,
  Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWardAqi } from '@/hooks/useWardAqi';
import type { WardAqi } from '@/api/wards';
import { getAqiCategory, AQI_CATEGORIES, type AqiCategoryInfo } from '@/lib/aqi';
import { WardAqiMap, normalizeProvince, type ProvinceMapDatum } from '@/components/local/WardAqiMap';

/* ═══════════════════════════════════════════════════════════════
   REGION CLASSIFIER — 34 tỉnh/thành sau sáp nhập 2025
   ═══════════════════════════════════════════════════════════════ */
type RegionCode = 'north' | 'central' | 'south' | 'other';

const NORTH = new Set([
  'hà nội', 'hải phòng', 'quảng ninh', 'cao bằng', 'lạng sơn', 'lào cai', 'điện biên',
  'lai châu', 'sơn la', 'thái nguyên', 'phú thọ', 'bắc ninh', 'hưng yên', 'ninh bình', 'tuyên quang',
]);
const CENTRAL = new Set([
  'thanh hóa', 'nghệ an', 'hà tĩnh', 'quảng trị', 'huế', 'đà nẵng', 'quảng ngãi',
  'khánh hòa', 'gia lai', 'đắk lắk', 'lâm đồng',
]);
const SOUTH = new Set([
  'hồ chí minh', 'đồng nai', 'tây ninh', 'đồng tháp', 'an giang', 'vĩnh long', 'cần thơ', 'cà mau',
]);

function regionOf(key: string): RegionCode {
  if (NORTH.has(key)) return 'north';
  if (CENTRAL.has(key)) return 'central';
  if (SOUTH.has(key)) return 'south';
  return 'other';
}

const REGION_LABEL: Record<RegionCode, string> = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
  other: 'Khác',
};

/* ═══════════════════════════════════════════════════════════════
   AGGREGATION
   ═══════════════════════════════════════════════════════════════ */
interface ProvinceAgg {
  name: string;
  key: string;
  region: RegionCode;
  wards: WardAqi[];
  wardCount: number;
  avgAqi: number | null;
  avgPm25: number | null;
  avgPm10: number | null;
  category: AqiCategoryInfo;
}

function avgOf(nums: (number | null)[]): number | null {
  const v = nums.filter((n): n is number => n != null && !Number.isNaN(n));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/* ═══════════════════════════════════════════════════════════════
   MICRO-VISUALIZATION — minh hoạ (ward API chưa có time-series),
   giá trị tất định theo id giống pattern AQICard.
   ═══════════════════════════════════════════════════════════════ */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function Sparkline({ seed, value, color }: { seed: string; value: number; color: string }) {
  const n = 8;
  let h = hash(seed);
  const vals = Array.from({ length: n }, () => {
    h = (Math.imul(h, 1103515245) + 12345) & 0x7fffffff;
    const noise = ((h % 1000) / 1000 - 0.5) * 0.45;
    return Math.max(1, value * (1 + noise));
  });
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 60;
  const ht = 18;
  const points = vals.map((v, i) => `${(i / (n - 1)) * w},${ht - ((v - min) / range) * ht}`).join(' ');
  return (
    <svg width={w} height={ht} viewBox={`0 0 ${w} ${ht}`} className="flex-shrink-0" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    </svg>
  );
}

function trendOf(seed: string): { dir: 'up' | 'down' | 'stable'; delta: number } {
  const s = hash(seed);
  const dir = s % 3 === 0 ? 'up' : s % 3 === 1 ? 'down' : 'stable';
  return { dir, delta: dir === 'stable' ? 0 : (s % 8) + 1 };
}

function TrendBadge({ seed, className = '' }: { seed: string; className?: string }) {
  const { dir, delta } = trendOf(seed);
  if (dir === 'up')
    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold text-destructive/80 ${className}`}>
        <TrendingUp className="w-3 h-3" /> {delta}%
      </span>
    );
  if (dir === 'down')
    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${className}`} style={{ color: 'hsl(142 58% 40%)' }}>
        <TrendingDown className="w-3 h-3" /> {delta}%
      </span>
    );
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground ${className}`}>
      <Minus className="w-3 h-3" /> 0%
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SMALL UI PARTS
   ═══════════════════════════════════════════════════════════════ */
function AqiPill({ aqi, size = 'md' }: { aqi: number | null; size?: 'sm' | 'md' | 'lg' }) {
  const cat = getAqiCategory(aqi);
  const cls =
    size === 'lg'
      ? 'min-w-[3.25rem] text-xl px-2.5 py-1'
      : size === 'sm'
        ? 'min-w-[2.25rem] text-xs px-1.5 py-0.5'
        : 'min-w-[2.75rem] text-sm px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-bold tabular-nums leading-none ${cls}`}
      style={{ background: cat.color, color: cat.textColor }}
    >
      {aqi ?? '—'}
    </span>
  );
}

function StatusBadge({ aqi }: { aqi: number | null }) {
  const cat = getAqiCategory(aqi);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: `${cat.color}22`, color: cat.color }}
    >
      {cat.label}
    </span>
  );
}

function WardCard({ w }: { w: WardAqi }) {
  const cat = getAqiCategory(w.aqi);
  return (
    <div className="ow-tile p-3 relative overflow-hidden">
      <span className="absolute left-0 inset-y-0 w-1" style={{ background: cat.color }} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-foreground line-clamp-1 leading-snug">{w.name}</p>
        <TrendBadge seed={w.id} />
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <div className="text-2xl font-bold leading-none tabular-nums" style={{ color: cat.color }}>
            {w.aqi ?? '—'}
          </div>
          <div className="mt-1 text-[10px] font-medium" style={{ color: cat.color }}>
            {cat.labelShort}
          </div>
        </div>
        {w.aqi != null && <Sparkline seed={w.id} value={w.aqi} color={cat.color} />}
      </div>
      <div className="mt-2.5 pt-2 border-t border-border/40 grid grid-cols-2 gap-1 text-[10px]">
        <div>
          <span className="text-muted-foreground/80">PM2.5</span>
          <p className="font-semibold text-foreground tabular-nums">{w.pm25 != null ? w.pm25.toFixed(1) : '—'}</p>
        </div>
        <div>
          <span className="text-muted-foreground/80">PM10</span>
          <p className="font-semibold text-foreground tabular-nums">{w.pm10 != null ? w.pm10.toFixed(1) : '—'}</p>
        </div>
      </div>
    </div>
  );
}

const WARD_CAP = 48;

function ProvincePanel({
  agg,
  expanded,
  selected,
  search,
  onToggle,
}: {
  agg: ProvinceAgg;
  expanded: boolean;
  selected: boolean;
  search: string;
  onToggle: () => void;
}) {
  const q = search.trim().toLowerCase();
  const provMatch = q ? agg.name.toLowerCase().includes(q) : false;
  const wardsToShow = q && !provMatch ? agg.wards.filter((w) => w.name.toLowerCase().includes(q)) : agg.wards;
  const shown = wardsToShow.slice(0, WARD_CAP);

  return (
    <div
      id={`prov-${agg.key}`}
      className={`ow-card overflow-hidden scroll-mt-24 transition-shadow ${selected ? 'ring-2 ring-primary/40' : ''}`}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/40 transition-colors"
      >
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`} />
        <span
          className="flex w-9 h-9 items-center justify-center rounded-xl flex-shrink-0"
          style={{ background: 'hsl(201 100% 14% / 0.07)', color: 'hsl(201 100% 22%)' }}
        >
          <MapPin className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground truncate">{agg.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {REGION_LABEL[agg.region]} · {agg.wardCount} xã/phường
          </div>
        </div>

        {/* Metrics — collapse progressively on small screens */}
        <div className="hidden md:flex items-center gap-5 text-right flex-shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70">PM2.5</div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {agg.avgPm25 != null ? agg.avgPm25.toFixed(1) : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70">PM10</div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {agg.avgPm10 != null ? agg.avgPm10.toFixed(1) : '—'}
            </div>
          </div>
        </div>

        <div className="hidden sm:block flex-shrink-0">
          <StatusBadge aqi={agg.avgAqi} />
        </div>
        <TrendBadge seed={agg.key} className="hidden lg:inline-flex flex-shrink-0" />
        <AqiPill aqi={agg.avgAqi} size="lg" />
      </button>

      {/* Expanded ward cards */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/40">
          {shown.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Không có xã/phường khớp tìm kiếm.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-3">
              {shown.map((w) => (
                <WardCard key={w.id} w={w} />
              ))}
            </div>
          )}
          {wardsToShow.length > WARD_CAP && (
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Hiển thị {WARD_CAP}/{wardsToShow.length} xã/phường — dùng ô tìm kiếm để lọc nhanh.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface SummaryCard {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  tint: string;
  valueColor?: string;
  small?: boolean;
  onClick?: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LocalAqi() {
  const { data, isLoading, error } = useWardAqi();

  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<RegionCode | 'all'>('all');
  const [cat, setCat] = useState<string>('all');
  const [status, setStatus] = useState<'all' | 'safe' | 'polluted'>('all');
  const [sort, setSort] = useState<'aqi_desc' | 'aqi_asc' | 'name' | 'wards'>('aqi_desc');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const wards = useMemo(() => data ?? [], [data]);

  /* Aggregate wards → provinces */
  const aggs = useMemo<ProvinceAgg[]>(() => {
    const map = new Map<string, WardAqi[]>();
    for (const w of wards) {
      const name = w.provinceName ?? 'Khác';
      const list = map.get(name);
      if (list) list.push(w);
      else map.set(name, [w]);
    }
    return Array.from(map.entries()).map(([name, list]) => {
      const key = normalizeProvince(name);
      const avgAqi = avgOf(list.map((w) => w.aqi));
      const rounded = avgAqi != null ? Math.round(avgAqi) : null;
      return {
        name,
        key,
        region: regionOf(key),
        wards: [...list].sort((a, b) => (b.aqi ?? -1) - (a.aqi ?? -1)),
        wardCount: list.length,
        avgAqi: rounded,
        avgPm25: avgOf(list.map((w) => w.pm25)),
        avgPm10: avgOf(list.map((w) => w.pm10)),
        category: getAqiCategory(rounded),
      };
    });
  }, [wards]);

  /* Summary */
  const summary = useMemo(() => {
    const withAqi = aggs.filter((p) => p.avgAqi != null);
    const overall = avgOf(wards.map((w) => w.aqi));
    const most = withAqi.length ? withAqi.reduce((m, p) => (p.avgAqi! > m.avgAqi! ? p : m)) : null;
    const clean = withAqi.length ? withAqi.reduce((m, p) => (p.avgAqi! < m.avgAqi! ? p : m)) : null;
    return {
      provinces: aggs.length,
      wards: wards.length,
      avgAqi: overall != null ? Math.round(overall) : null,
      most,
      clean,
    };
  }, [aggs, wards]);

  const topPolluted = useMemo(
    () => aggs.filter((p) => p.avgAqi != null).sort((a, b) => b.avgAqi! - a.avgAqi!).slice(0, 6),
    [aggs],
  );

  const mapData = useMemo(() => {
    const m = new Map<string, ProvinceMapDatum>();
    for (const p of aggs) m.set(p.key, { name: p.name, avgAqi: p.avgAqi, wardCount: p.wardCount });
    return m;
  }, [aggs]);

  /* Filter + sort directory */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = aggs.filter((p) => {
      if (region !== 'all' && p.region !== region) return false;
      if (cat !== 'all' && p.category.code !== cat) return false;
      if (status === 'safe' && !(p.avgAqi != null && p.avgAqi <= 100)) return false;
      if (status === 'polluted' && !(p.avgAqi != null && p.avgAqi > 100)) return false;
      if (q) {
        const provMatch = p.name.toLowerCase().includes(q);
        const wardMatch = p.wards.some((w) => w.name.toLowerCase().includes(q));
        if (!provMatch && !wardMatch) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      switch (sort) {
        case 'aqi_desc':
          return (b.avgAqi ?? -1) - (a.avgAqi ?? -1);
        case 'aqi_asc':
          return (a.avgAqi ?? Infinity) - (b.avgAqi ?? Infinity);
        case 'name':
          return a.name.localeCompare(b.name, 'vi');
        case 'wards':
          return b.wardCount - a.wardCount;
      }
    });
    return list;
  }, [aggs, search, region, cat, status, sort]);

  const toggle = (key: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const focusProvince = (key: string) => {
    setRegion('all');
    setCat('all');
    setStatus('all');
    setSearch('');
    setSelectedKey(key);
    setExpanded(new Set([key]));
    setTimeout(() => document.getElementById(`prov-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 140);
  };

  /* ── Loading / error / empty ── */
  if (isLoading && wards.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 md:px-6 py-10">
        <div className="max-w-2xl mx-auto ow-card p-8 text-center">
          <p className="section-label">Đang tải</p>
          <h1 className="mt-3 text-xl font-semibold text-foreground">Đang tải dữ liệu địa phương…</h1>
        </div>
      </div>
    );
  }
  if (error && wards.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 md:px-6 py-10">
        <div className="max-w-2xl mx-auto ow-card p-8 text-center">
          <p className="section-label text-destructive">Lỗi</p>
          <h1 className="mt-3 text-xl font-semibold text-foreground">Không tải được dữ liệu địa phương</h1>
        </div>
      </div>
    );
  }

  const SUMMARY_CARDS: SummaryCard[] = [
    { icon: Building2, label: 'Tỉnh / thành', value: summary.provinces.toString(), sub: 'có dữ liệu phân tích', tint: 'hsl(201 100% 14%)' },
    { icon: Layers, label: 'Xã / phường', value: summary.wards.toLocaleString('vi'), sub: 'điểm AQI (IDW)', tint: 'hsl(203 39% 52%)' },
    { icon: Wind, label: 'AQI trung bình', value: summary.avgAqi != null ? String(summary.avgAqi) : '—', sub: getAqiCategory(summary.avgAqi).label, tint: getAqiCategory(summary.avgAqi).color, valueColor: getAqiCategory(summary.avgAqi).color },
    { icon: AlertTriangle, label: 'Ô nhiễm nhất', value: summary.most?.name ?? '—', sub: summary.most ? `AQI ${summary.most.avgAqi}` : '', tint: getAqiCategory(summary.most?.avgAqi ?? null).color, small: true, onClick: summary.most ? () => focusProvince(summary.most!.key) : undefined },
    { icon: Leaf, label: 'Trong lành nhất', value: summary.clean?.name ?? '—', sub: summary.clean ? `AQI ${summary.clean.avgAqi}` : '', tint: getAqiCategory(summary.clean?.avgAqi ?? null).color, small: true, onClick: summary.clean ? () => focusProvince(summary.clean!.key) : undefined },
  ];

  return (
    <div className="min-h-screen bg-background pb-14">
      <div className="px-4 md:px-5 lg:px-7 pt-6 space-y-6">
        {/* ── Page header ── */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="flex w-11 h-11 items-center justify-center rounded-2xl" style={{ background: 'hsl(201 100% 14% / 0.08)', color: 'hsl(201 100% 22%)' }}>
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                Chất lượng không khí theo địa phương
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                AQI phân tích (IDW) cho từng xã/phường — gom theo tỉnh/thành trên toàn quốc
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: 'hsl(16 100% 60% / 0.10)', color: 'hsl(16 100% 50%)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(16 100% 52%)' }} />
            Trực tiếp
          </span>
        </motion.header>

        {/* ── SECTION 1 · Summary ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {SUMMARY_CARDS.map((c) => (
            <div
              key={c.label}
              onClick={c.onClick}
              role={c.onClick ? 'button' : undefined}
              tabIndex={c.onClick ? 0 : undefined}
              className={`ow-card p-4 text-left flex flex-col gap-1 ${c.onClick ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <c.icon className="w-4 h-4" style={{ color: c.tint }} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">{c.label}</span>
              </div>
              <div
                className={`font-bold text-foreground leading-tight ${c.small ? 'text-base line-clamp-1' : 'text-2xl md:text-3xl tabular-nums'}`}
                style={c.valueColor ? { color: c.valueColor } : undefined}
              >
                {c.value}
              </div>
              {c.sub && <div className="text-[11px] text-muted-foreground line-clamp-1">{c.sub}</div>}
            </div>
          ))}
        </div>

        {/* ── SECTION 2 + 3 · Map + Most polluted ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 ow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h2 className="text-sm font-semibold text-foreground">Bản đồ AQI Việt Nam</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                <Info className="w-3 h-3" /> Tô màu theo AQI trung bình mỗi tỉnh · di chuột để xem, bấm để focus
              </p>
            </div>
            <div className="relative h-[420px] md:h-[520px]">
              <WardAqiMap data={mapData} selectedKey={selectedKey} onSelect={(key) => focusProvince(key)} />
            </div>
          </div>

          <div className="ow-card overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive/80" />
              <h2 className="text-sm font-semibold text-foreground">Ô nhiễm nhất</h2>
            </div>
            <div data-lenis-prevent className="p-2 overflow-y-auto max-h-[480px] divide-y divide-border/30">
              {topPolluted.length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground text-center">Chưa có dữ liệu.</p>
              ) : (
                topPolluted.map((p, i) => (
                  <button
                    key={p.key}
                    onClick={() => focusProvince(p.key)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <span className="w-6 text-center text-sm font-bold text-muted-foreground tabular-nums flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.category.label}</div>
                    </div>
                    <AqiPill aqi={p.avgAqi} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 6 · Filters ── */}
        <div className="ow-card p-3 md:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tỉnh hoặc xã/phường…"
                className="w-full pl-9 pr-3 h-10 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionCode | 'all')}
                className="h-10 px-3 bg-secondary rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">Tất cả miền</option>
                <option value="north">Miền Bắc</option>
                <option value="central">Miền Trung</option>
                <option value="south">Miền Nam</option>
              </select>

              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="h-10 px-3 bg-secondary rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">Mọi mức AQI</option>
                {AQI_CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Status quick filter */}
              <div className="flex items-center bg-secondary rounded-xl p-0.5">
                {([
                  { v: 'all', l: 'Tất cả' },
                  { v: 'safe', l: '≤100' },
                  { v: 'polluted', l: '>100' },
                ] as const).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setStatus(o.v)}
                    className={`h-9 px-3 rounded-lg text-xs font-medium transition-colors ${
                      status === o.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-10 px-3 bg-secondary rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="aqi_desc">AQI cao → thấp</option>
                <option value="aqi_asc">AQI thấp → cao</option>
                <option value="name">Tên A → Z</option>
                <option value="wards">Nhiều xã/phường</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── SECTION 4 + 5 · Directory ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground">
              Danh mục địa phương <span className="text-muted-foreground font-normal">({filtered.length})</span>
            </h2>
            {(region !== 'all' || cat !== 'all' || status !== 'all' || search) && (
              <button
                onClick={() => {
                  setRegion('all');
                  setCat('all');
                  setStatus('all');
                  setSearch('');
                }}
                className="text-xs text-primary hover:underline"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="ow-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Không có địa phương nào khớp bộ lọc.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((agg) => (
                <ProvincePanel
                  key={agg.key}
                  agg={agg}
                  expanded={expanded.has(agg.key)}
                  selected={selectedKey === agg.key}
                  search={search}
                  onToggle={() => toggle(agg.key)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
