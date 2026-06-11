import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Radio, Wind } from 'lucide-react';
import type { Station } from '@/data/mockData';

interface AQISummaryProps {
  stations: Station[];
}

export function AQISummary({ stations }: AQISummaryProps) {
  if (stations.length === 0) {
    return null;
  }

  const avgAqi = Math.round(stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length);
  const alertCount = stations.filter(s => s.aqi > 100).length;
  const worstStation = [...stations].sort((a, b) => b.aqi - a.aqi)[0];

  const cards = [
    {
      icon: Wind,
      label: 'AQI trung bình',
      value: avgAqi,
      sub: 'Toàn quốc',
      iconClass: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
      valueClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Radio,
      label: 'Tổng trạm',
      value: stations.length,
      sub: 'Đang hoạt động',
      iconClass: 'bg-cyan-500/12 text-cyan-600 dark:text-cyan-400',
      valueClass: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      icon: AlertTriangle,
      label: 'Cảnh báo',
      value: alertCount,
      sub: 'Vượt ngưỡng',
      iconClass: 'bg-orange-500/12 text-orange-600 dark:text-orange-400',
      valueClass: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: Activity,
      label: 'Ô nhiễm nhất',
      value: worstStation.aqi,
      sub: worstStation.region,
      iconClass: 'bg-purple-500/12 text-purple-600 dark:text-purple-400',
      valueClass: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="ow-card p-4 md:p-5"
        >
          <span className={`flex w-11 h-11 md:w-12 md:h-12 rounded-2xl items-center justify-center ${card.iconClass}`}>
            <card.icon className="w-5 h-5 md:w-[22px] md:h-[22px]" />
          </span>
          <p className="mt-3 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {card.label}
          </p>
          <div className={`mt-1 text-3xl md:text-4xl font-bold font-display leading-none ${card.valueClass}`}>
            {card.value}
          </div>
          <p className="mt-1.5 text-[11px] md:text-xs text-muted-foreground truncate">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
