/**
 * AQI Legend — panel nổi ở góc map, hiển thị 6 mức AQI theo thang EPA
 * với màu, ngưỡng và mô tả ngắn. Lấy cảm hứng từ iqair.com/air-quality-map.
 */

import { useState } from 'react';
import { AQI_CATEGORIES } from '@/lib/aqi';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AQILegendProps {
  className?: string;
}

export function AQILegend({ className = '' }: AQILegendProps) {
  // Mobile: gập mặc định — bảng mở cao ~230px che đúng cụm trạm miền Nam.
  // Đọc thẳng innerWidth lúc khởi tạo (useIsMobile trả undefined ở render đầu).
  const [expanded, setExpanded] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768,
  );

  return (
    <div
      className={`pointer-events-auto absolute bottom-4 right-4 z-[400] w-[240px] rounded-2xl bg-card/95 backdrop-blur-md border border-border/60 shadow-xl ${className}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/50 rounded-t-2xl"
      >
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          Thang AQI (US EPA)
        </span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="px-3 pb-3 space-y-1.5 text-[11px]">
              {AQI_CATEGORIES.map((c) => (
                <li key={c.code} className="flex items-center gap-2">
                  <span
                    className="inline-block w-6 h-4 rounded-sm shrink-0 border border-border/40"
                    style={{ backgroundColor: c.color }}
                    aria-hidden
                  />
                  <span className="font-mono tabular-nums text-muted-foreground w-16">
                    {c.min}
                    {c.max !== null ? `-${c.max}` : '+'}
                  </span>
                  <span className="text-foreground truncate" title={c.label}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="px-3 pb-3 text-[10px] text-muted-foreground leading-tight border-t border-border/40 pt-2">
              Nhấn marker để xem chi tiết pollutants, weather và dự báo 24h.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
