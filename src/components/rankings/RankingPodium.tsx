import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Wind, Thermometer } from 'lucide-react';
import { getAQILevel, getAQIColors } from '@/utils/aqi';
import type { StationWithReading } from '@/types';
import { MEDALS, AqiBadge, StatusBadge } from './aqiVisuals';

interface RankingPodiumProps {
  stations: StationWithReading[];
}

/** Big featured card for Rank 1 — the dominant focal point of the podium. */
function HeroCard({ station }: { station: StationWithReading }) {
  const { solid, tint } = getAQIColors(getAQILevel(station.aqi));
  const medal = MEDALS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="ow-card relative h-full overflow-hidden"
      style={{ borderColor: `${solid}`, boxShadow: `0 1px 2px hsl(201 100% 14% / 0.04), 0 18px 44px -22px ${solid}` }}
    >
      <Link to={`/stations/${station.id}`} className="block h-full p-5 md:p-6">
        {/* AQI-tinted wash + giant rank watermark */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(120% 100% at 100% 0%, ${tint} 0%, transparent 60%)` }}
        />
        <span
          className="pointer-events-none absolute -right-3 -top-8 select-none font-black leading-none"
          style={{ fontSize: '11rem', color: solid, opacity: 0.07, fontFamily: 'var(--font-sans)' }}
        >
          1
        </span>

        <div className="relative flex flex-col h-full">
          {/* Medal + rank label */}
          <div className="flex items-center gap-2.5">
            <span
              className="flex w-11 h-11 items-center justify-center rounded-xl text-xl shadow-sm"
              style={{ background: medal.grad, boxShadow: `0 4px 14px -4px ${medal.glow}` }}
            >
              {medal.emoji}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: solid }}>
                Điểm nóng ô nhiễm
              </p>
              <p className="text-xs text-muted-foreground font-medium">Hạng 1 · AQI cao nhất cả nước</p>
            </div>
          </div>

          {/* Station identity */}
          <div className="mt-5">
            <h3 className="text-2xl md:text-[1.7rem] font-bold leading-tight tracking-tight text-foreground line-clamp-2">
              {station.name}
            </h3>
            {station.region && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {station.region}
              </p>
            )}
          </div>

          {/* AQI focal block */}
          <div className="mt-auto pt-6 flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Chỉ số AQI</p>
              <div
                className="leading-none"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(3rem, 9vw, 4.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  fontVariantNumeric: 'tabular-nums',
                  color: solid,
                }}
              >
                {station.aqi}
              </div>
              <StatusBadge aqi={station.aqi} className="mt-2" />
            </div>

            {/* Secondary metrics */}
            <div className="flex flex-col gap-2 text-right">
              <div className="flex items-center justify-end gap-1.5 text-sm">
                <Wind className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold tabular-nums text-foreground">{station.pm25}</span>
                <span className="text-[11px] text-muted-foreground">PM2.5</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-sm">
                <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold tabular-nums text-foreground">{station.temperature}°C</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** Compact horizontal card for Rank 2 & 3. */
function RunnerCard({ station, rank, delay }: { station: StationWithReading; rank: 1 | 2; delay: number }) {
  const { solid } = getAQIColors(getAQILevel(station.aqi));
  const medal = MEDALS[rank];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="ow-card relative overflow-hidden flex-1"
    >
      <span className="absolute inset-y-0 left-0 w-1 rounded-full" style={{ background: solid }} />
      <Link to={`/stations/${station.id}`} className="flex items-center gap-3.5 p-4 pl-5">
        <span
          className="flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-xl text-lg shadow-sm"
          style={{ background: medal.grad, boxShadow: `0 4px 12px -5px ${medal.glow}` }}
        >
          {medal.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <h4 className="text-[15px] font-bold leading-tight text-foreground truncate">{station.name}</h4>
          {station.region && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground font-medium truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {station.region}
            </p>
          )}
          <div className="mt-1.5">
            <StatusBadge aqi={station.aqi} />
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0">
          <span className="section-label mb-0.5">AQI</span>
          <AqiBadge aqi={station.aqi} size="lg" />
        </div>
      </Link>
    </motion.div>
  );
}

export function RankingPodium({ stations }: RankingPodiumProps) {
  if (stations.length === 0) return null;

  const top3 = [...stations].sort((a, b) => b.aqi - a.aqi).slice(0, 3);
  const [first, second, third] = top3;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Top 3 điểm nóng ô nhiễm</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Ba trạm có chỉ số AQI cao nhất hiện tại</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch">
        {first && <HeroCard station={first} />}
        <div className="flex flex-col gap-4">
          {second && <RunnerCard station={second} rank={1} delay={0.1} />}
          {third && <RunnerCard station={third} rank={2} delay={0.18} />}
        </div>
      </div>
    </section>
  );
}
