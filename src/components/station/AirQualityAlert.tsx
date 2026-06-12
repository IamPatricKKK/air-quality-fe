import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, ShieldAlert, Skull, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAqiCategory, type AqiCategoryCode } from "@/lib/aqi";
import { aqiColors } from "./stationInsights";

interface Props {
  aqi: number;
}

interface AlertContent {
  emoji: string;
  Icon: LucideIcon;
  title: string;
  recommendation: string; // main recommendation
  risk: string; // main health risk
  protection: string; // main protective action
}

/** Single-message alert content per AQI category (Vietnamese). */
const ALERT_BY_CATEGORY: Record<AqiCategoryCode, AlertContent> = {
  good: {
    emoji: "🌿",
    Icon: ShieldCheck,
    title: "Không khí trong lành",
    recommendation: "Thoải mái tận hưởng các hoạt động ngoài trời.",
    risk: "Hầu như không có rủi ro cho sức khoẻ.",
    protection: "Mở cửa sổ cho không khí lưu thông.",
  },
  moderate: {
    emoji: "🙂",
    Icon: Activity,
    title: "Chất lượng không khí chấp nhận được",
    recommendation: "Người bình thường sinh hoạt như thường lệ.",
    risk: "Nhóm rất nhạy cảm có thể thấy khó chịu nhẹ.",
    protection: "Nhóm nhạy cảm nên giảm gắng sức kéo dài ngoài trời.",
  },
  unhealthy_sensitive: {
    emoji: "⚠️",
    Icon: AlertTriangle,
    title: "Không tốt cho nhóm nhạy cảm",
    recommendation: "Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời.",
    risk: "Trẻ em, người già và người bệnh hô hấp dễ bị kích ứng.",
    protection: "Đeo khẩu trang và đóng cửa sổ vào giờ cao điểm.",
  },
  unhealthy: {
    emoji: "🚨",
    Icon: ShieldAlert,
    title: "Chất lượng không khí không tốt",
    recommendation: "Hạn chế ra ngoài; nhóm nhạy cảm nên tránh hẳn.",
    risk: "Mọi người có thể gặp triệu chứng hô hấp, nhóm nhạy cảm nặng hơn.",
    protection: "Đeo khẩu trang N95 và bật máy lọc không khí trong nhà.",
  },
  very_unhealthy: {
    emoji: "🛑",
    Icon: ShieldAlert,
    title: "Cảnh báo sức khoẻ — Rất không tốt",
    recommendation: "Mọi người nên ở trong nhà, tránh ra ngoài.",
    risk: "Nguy cơ ảnh hưởng sức khoẻ nghiêm trọng cho tất cả mọi người.",
    protection: "Đóng kín cửa, máy lọc HEPA chạy liên tục, N95 khi buộc ra ngoài.",
  },
  hazardous: {
    emoji: "☠️",
    Icon: Skull,
    title: "Nguy hại — Tình trạng khẩn cấp",
    recommendation: "Tuyệt đối không ra ngoài nếu không cần thiết.",
    risk: "Cảnh báo khẩn cấp: ảnh hưởng tới toàn bộ dân cư.",
    protection: "Trú trong nhà kín, dùng máy lọc HEPA, theo dõi cảnh báo y tế.",
  },
  unknown: {
    emoji: "❓",
    Icon: Activity,
    title: "Chưa có dữ liệu",
    recommendation: "Chưa đủ dữ liệu để đưa ra khuyến nghị.",
    risk: "—",
    protection: "—",
  },
};

export function AirQualityAlert({ aqi }: Props) {
  const cat = getAqiCategory(aqi);
  if (cat.code === "unknown") return null;
  const content = ALERT_BY_CATEGORY[cat.code];
  const { solid, tint } = aqiColors(aqi);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="ow-card relative overflow-hidden"
      style={{ borderColor: `${solid}66` }}
    >
      {/* Left accent bar */}
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: solid }} />

      <div className="p-5 md:p-6 pl-6 md:pl-7">
        {/* Headline */}
        <div className="flex items-center gap-3">
          <span
            className="flex w-12 h-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: tint }}
          >
            {content.emoji}
          </span>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-bold leading-tight" style={{ color: solid }}>
              {content.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              AQI {aqi} · {cat.label}
            </p>
          </div>
        </div>

        {/* Three-pillar breakdown */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <AlertPillar label="Khuyến nghị chính" text={content.recommendation} Icon={content.Icon} color={solid} tint={tint} />
          <AlertPillar label="Rủi ro chính" text={content.risk} Icon={AlertTriangle} color={solid} tint={tint} />
          <AlertPillar label="Cách bảo vệ" text={content.protection} Icon={ShieldCheck} color={solid} tint={tint} />
        </div>
      </div>
    </motion.section>
  );
}

function AlertPillar({
  label,
  text,
  Icon,
  color,
  tint,
}: {
  label: string;
  text: string;
  Icon: LucideIcon;
  color: string;
  tint: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-3.5">
      <div className="flex items-center gap-2">
        <span className="flex w-7 h-7 items-center justify-center rounded-lg" style={{ background: tint }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </span>
        <p className="section-label">{label}</p>
      </div>
      <p className="mt-2 text-sm text-foreground leading-snug">{text}</p>
    </div>
  );
}

export default AirQualityAlert;
