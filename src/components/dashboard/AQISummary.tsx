import { motion } from 'framer-motion';
import { Activity, AlertTriangle, MapPin, Wind } from 'lucide-react';
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
    { icon: Wind, label: 'AQI trung bình', value: avgAqi, sub: 'Toàn quốc', color: 'text-primary' },
    { icon: MapPin, label: 'Tổng trạm', value: stations.length, sub: 'Đang hoạt động', color: 'text-primary' },
    { icon: AlertTriangle, label: 'Cảnh báo', value: alertCount, sub: 'Vượt ngưỡng', color: 'text-destructive' },
    { icon: Activity, label: 'Ô nhiễm nhất', value: worstStation.aqi, sub: worstStation.region, color: 'text-aqi-unhealthy' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <div className={`text-2xl font-bold font-display ${card.color}`}>{card.value}</div>
          <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
