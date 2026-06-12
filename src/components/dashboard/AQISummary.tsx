import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Radio, Wind } from 'lucide-react';
import type { StationWithReading } from '@/types';

interface AQISummaryProps {
  stations: StationWithReading[];
}

/* Brand-aligned card configurations. Colors derived strictly from the
   design system: navy, sky blue, ember orange, and the AQI semantic value. */
function getCards(stations: StationWithReading[]) {
  const avgAqi = Math.round(stations.reduce((s, x) => s + x.aqi, 0) / stations.length);
  const alertCount = stations.filter(s => s.aqi > 100).length;
  const worstStation = [...stations].sort((a, b) => b.aqi - a.aqi)[0];

  return [
    {
      icon: Wind,
      label: 'AQI trung bình',
      value: avgAqi,
      sub: 'Toàn quốc',
      /* Sky blue — informational */
      iconBg: 'hsl(203 39% 57% / 0.12)',
      iconColor: 'hsl(203 39% 52%)',
      valueColor: 'hsl(201 100% 14%)',
      accentBar: 'hsl(203 39% 57%)',
    },
    {
      icon: Radio,
      label: 'Tổng trạm',
      value: stations.length,
      sub: 'Đang hoạt động',
      /* Navy — authority */
      iconBg: 'hsl(201 100% 14% / 0.09)',
      iconColor: 'hsl(201 100% 22%)',
      valueColor: 'hsl(201 100% 14%)',
      accentBar: 'hsl(201 100% 14%)',
    },
    {
      icon: AlertTriangle,
      label: 'Cảnh báo',
      value: alertCount,
      sub: 'Vượt ngưỡng AQI 100',
      /* Ember orange — warning (natural fit for air quality) */
      iconBg: 'hsl(16 100% 60% / 0.12)',
      iconColor: 'hsl(16 100% 50%)',
      valueColor: alertCount > 0 ? 'hsl(16 100% 45%)' : 'hsl(201 100% 14%)',
      accentBar: 'hsl(16 100% 55%)',
    },
    {
      icon: Activity,
      label: 'Ô nhiễm nhất',
      value: worstStation.aqi,
      sub: worstStation.name || worstStation.region,
      /* Contextual: amber/orange for elevated, navy for clean */
      iconBg: worstStation.aqi > 100 ? 'hsl(28 90% 50% / 0.12)' : 'hsl(142 58% 36% / 0.12)',
      iconColor: worstStation.aqi > 100 ? 'hsl(28 90% 44%)' : 'hsl(142 58% 32%)',
      valueColor: worstStation.aqi > 100 ? 'hsl(28 90% 40%)' : 'hsl(142 58% 32%)',
      accentBar: worstStation.aqi > 100 ? 'hsl(28 90% 50%)' : 'hsl(142 58% 36%)',
    },
  ];
}

export function AQISummary({ stations }: AQISummaryProps) {
  if (stations.length === 0) return null;

  const cards = getCards(stations);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="ow-card relative overflow-hidden p-4 md:p-5"
        >
          {/* Colored left accent bar */}
          <span
            className="absolute inset-y-0 left-0 w-[3px] rounded-full"
            style={{ background: card.accentBar }}
          />

          {/* Icon */}
          <span
            className="flex w-10 h-10 rounded-xl items-center justify-center"
            style={{ background: card.iconBg }}
          >
            <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
          </span>

          {/* Label */}
          <p className="mt-3 section-label">{card.label}</p>

          {/* Value — dominant focal point */}
          <div
            className="mt-1 leading-none"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
              color: card.valueColor,
            }}
          >
            {card.value}
          </div>

          {/* Sub-label */}
          <p className="mt-1.5 text-[11px] text-muted-foreground truncate font-medium">
            {card.sub}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
