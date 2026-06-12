import { motion } from 'framer-motion';
import { Reveal } from '@/components/landing/Reveal';

interface CoverageSectionProps {
  /** Real number of active stations; falls back to the site-wide "50+" claim. */
  stationCount?: number;
  /** Real list of covered cities derived from station data. */
  cities?: string[];
}

/** Fallback coverage list (site copy) shown until real station data arrives. */
const FALLBACK_CITIES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế',
  'Nha Trang', 'Đà Lạt', 'Vũng Tàu', 'Quy Nhơn', 'Buôn Ma Thuột', 'Vinh',
  'Hạ Long', 'Biên Hoà', 'Thái Nguyên',
];

/**
 * Trust band: coverage stats (live station count when loaded) over a seamless,
 * auto-scrolling marquee of covered cities.
 */
export function CoverageSection({ stationCount, cities }: CoverageSectionProps) {
  const stats = [
    { value: stationCount ? String(stationCount) : '50+', label: 'Trạm quan trắc' },
    { value: '4', label: 'Nguồn dữ liệu' },
    { value: '5 phút', label: 'Tần suất cập nhật' },
    { value: '24h', label: 'Dự báo AI' },
  ];
  const shownCities = cities?.length ? cities : FALLBACK_CITIES;

  return (
    <section className="border-y border-border/40 bg-card/40 py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-3xl md:text-4xl text-aqi-gradient">{s.value}</div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>

      <div className="mt-10 md:mt-12">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-5">
          Đang theo dõi tại
        </p>
        <div className="relative overflow-hidden">
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent" />
          <motion.div
            className="flex w-max gap-3"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
          >
            {[...shownCities, ...shownCities].map((city, i) => (
              <span
                key={`${city}-${i}`}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/40 text-sm font-medium text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {city}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
