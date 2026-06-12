import { motion } from 'framer-motion';
import { Radio, Gauge, TrendingUp, Leaf, type LucideIcon } from 'lucide-react';
import { getAQILevel, getAQIColors } from '@/utils/aqi';
import type { StationWithReading } from '@/types';

interface RankingStatsProps {
  stations: StationWithReading[];
}

/** Average AQI grouped by region — powers the best/worst region stats. */
function regionAverages(stations: StationWithReading[]) {
  const buckets = new Map<string, number[]>();
  for (const s of stations) {
    const arr = buckets.get(s.region) ?? [];
    arr.push(s.aqi);
    buckets.set(s.region, arr);
  }
  return [...buckets.entries()]
    .map(([region, values]) => ({
      region,
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      count: values.length,
    }))
    .sort((a, b) => b.avg - a.avg);
}

interface StatCard {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  accentBar: string;
}

export function RankingStats({ stations }: RankingStatsProps) {
  if (stations.length === 0) return null;

  const avgAqi = Math.round(stations.reduce((s, x) => s + x.aqi, 0) / stations.length);
  const regions = regionAverages(stations);
  const worst = regions[0];
  const best = regions[regions.length - 1];

  const avgColors = getAQIColors(getAQILevel(avgAqi));
  const worstColors = getAQIColors(getAQILevel(worst.avg));
  const bestColors = getAQIColors(getAQILevel(best.avg));

  const cards: StatCard[] = [
    {
      icon: Radio,
      label: 'Tổng số trạm',
      value: stations.length,
      sub: `${regions.length} khu vực · đang hoạt động`,
      iconBg: 'hsl(201 100% 14% / 0.09)',
      iconColor: 'hsl(201 100% 22%)',
      valueColor: 'hsl(201 100% 14%)',
      accentBar: 'hsl(201 100% 14%)',
    },
    {
      icon: Gauge,
      label: 'AQI trung bình',
      value: avgAqi,
      sub: 'Trên toàn bộ trạm quan trắc',
      iconBg: `${avgColors.tint}`,
      iconColor: avgColors.solid,
      valueColor: avgColors.solid,
      accentBar: avgColors.solid,
    },
    {
      icon: TrendingUp,
      label: 'Khu vực ô nhiễm nhất',
      value: worst.avg,
      sub: worst.region,
      iconBg: `${worstColors.tint}`,
      iconColor: worstColors.solid,
      valueColor: worstColors.solid,
      accentBar: worstColors.solid,
    },
    {
      icon: Leaf,
      label: 'Khu vực trong lành nhất',
      value: best.avg,
      sub: best.region,
      iconBg: `${bestColors.tint}`,
      iconColor: bestColors.solid,
      valueColor: bestColors.solid,
      accentBar: bestColors.solid,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="ow-card relative overflow-hidden p-4 md:p-5"
        >
          <span className="absolute inset-y-0 left-0 w-[3px] rounded-full" style={{ background: card.accentBar }} />

          <span className="flex w-10 h-10 rounded-xl items-center justify-center" style={{ background: card.iconBg }}>
            <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
          </span>

          <p className="mt-3 section-label">{card.label}</p>

          <div
            className="mt-1 leading-none"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
              color: card.valueColor,
            }}
          >
            {card.value}
          </div>

          <p className="mt-1.5 text-[11px] text-muted-foreground truncate font-medium">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
