import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, MapPin, Info } from 'lucide-react';
import { useWardAqi } from '@/hooks/useWardAqi';
import { getAqiCategory } from '@/lib/aqi';
import type { WardAqi } from '@/api/wards';

/**
 * Panel "Chất lượng không khí theo địa phương".
 *
 * Liệt kê xã/phường kèm AQI ĐÃ PHÂN TÍCH (air-quality-be suy bằng IDW từ
 * trạm thật → DB → air-quality-api). KHÔNG phải trạm trên bản đồ, KHÔNG
 * gọi API ngoài. Chỉ hiển thị địa phương đã có kết quả phân tích.
 */
export function WardAqiPanel() {
  const { data, isLoading, error } = useWardAqi();
  const [search, setSearch] = useState('');
  const [openProvinces, setOpenProvinces] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const wards = data ?? [];
    const q = search.trim().toLowerCase();
    const filtered = q
      ? wards.filter(
          (w) =>
            w.name.toLowerCase().includes(q) ||
            (w.provinceName ?? '').toLowerCase().includes(q),
        )
      : wards;
    const map = new Map<string, WardAqi[]>();
    for (const w of filtered) {
      const key = w.provinceName ?? 'Khác';
      const list = map.get(key);
      if (list) list.push(w);
      else map.set(key, [w]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'vi'));
  }, [data, search]);

  const toggle = (prov: string) =>
    setOpenProvinces((s) => ({ ...s, [prov]: !s[prov] }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="glass-card overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border/50">
        <h2 className="text-sm font-semibold font-display text-foreground">
          Chất lượng không khí theo địa phương
        </h2>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          AQI phân tích từ trạm thật (IDW) cho xã/phường — không phải trạm đo
        </p>
      </div>

      <div className="px-4 py-2 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm xã/phường hoặc tỉnh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-secondary rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {isLoading && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Đang tải dữ liệu địa phương…
          </div>
        )}
        {error && !isLoading && (
          <div className="p-6 text-center text-xs text-destructive">
            Không tải được dữ liệu địa phương.
          </div>
        )}
        {!isLoading && !error && grouped.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Chưa có địa phương nào được phân tích.
          </div>
        )}

        {grouped.map(([province, wards]) => {
          const open = openProvinces[province] ?? false;
          return (
            <div key={province} className="border-b border-border/30 last:border-b-0">
              <button
                onClick={() => toggle(province)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  {open ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {province}
                </span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {wards.length} xã/phường
                </span>
              </button>

              {open && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-y border-border/40 bg-secondary/30">
                        <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                          Xã/Phường
                        </th>
                        <th className="px-3 py-2 text-center text-muted-foreground font-medium">
                          AQI
                        </th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                          Mức độ
                        </th>
                        <th className="px-3 py-2 text-right text-muted-foreground font-medium">
                          Độ tin cậy
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {wards.map((w) => {
                        const cat = getAqiCategory(w.aqi);
                        return (
                          <tr
                            key={w.id}
                            className="border-b border-border/20 last:border-b-0 hover:bg-secondary/30"
                          >
                            <td className="px-4 py-2 text-foreground">{w.name}</td>
                            <td className="px-3 py-2 text-center">
                              <span
                                className="inline-flex min-w-[2.5rem] justify-center rounded px-2 py-0.5 font-bold tabular-nums"
                                style={{ backgroundColor: cat.color, color: cat.textColor }}
                              >
                                {w.aqi ?? '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {cat.label}
                            </td>
                            <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                              {w.confidence != null
                                ? `${Math.round(w.confidence * 100)}%`
                                : '—'}
                              {w.nearestKm != null && (
                                <span className="opacity-60">
                                  {' '}· {Number(w.nearestKm).toFixed(1)}km
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
