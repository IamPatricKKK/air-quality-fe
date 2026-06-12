import { motion } from "framer-motion";
import { Check, X, AlertTriangle, HeartPulse } from "lucide-react";
import { getAqiCategory, type AqiCategoryCode } from "@/lib/aqi";
import { aqiColors } from "./stationInsights";

interface Props {
  aqi: number;
}

interface Guidance {
  dos: string[];
  avoid: string[];
  sensitive: string[];
}

/** Do / Avoid / Sensitive-group guidance per AQI category (Vietnamese). */
const GUIDANCE_BY_CATEGORY: Record<AqiCategoryCode, Guidance> = {
  good: {
    dos: ["Tập thể dục, chạy bộ ngoài trời", "Mở cửa sổ đón gió tự nhiên", "Cho trẻ vui chơi ngoài trời"],
    avoid: ["Không cần hạn chế gì đặc biệt"],
    sensitive: ["An toàn cho cả nhóm nhạy cảm"],
  },
  moderate: {
    dos: ["Sinh hoạt, vận động ngoài trời bình thường", "Vẫn có thể mở cửa thông thoáng"],
    avoid: ["Hạn chế gắng sức cường độ cao kéo dài nếu thấy khó chịu"],
    sensitive: ["Người rất nhạy cảm nên theo dõi triệu chứng hô hấp", "Giảm bớt thời gian vận động mạnh ngoài trời"],
  },
  unhealthy_sensitive: {
    dos: ["Hoạt động nhẹ nhàng ngoài trời vẫn ổn", "Theo dõi chỉ số AQI trong ngày", "Uống đủ nước, nghỉ ngơi hợp lý"],
    avoid: ["Tránh tập luyện nặng ngoài trời", "Hạn chế ở lâu cạnh đường đông xe"],
    sensitive: ["Trẻ em, người già nên giảm hoạt động ngoài trời", "Mang theo thuốc hô hấp nếu có bệnh nền", "Cân nhắc đeo khẩu trang khi ra ngoài"],
  },
  unhealthy: {
    dos: ["Ưu tiên hoạt động trong nhà", "Đeo khẩu trang khi buộc phải ra ngoài", "Bật máy lọc không khí trong phòng"],
    avoid: ["Tránh tập thể dục ngoài trời", "Không mở cửa sổ giờ cao điểm", "Hạn chế đưa trẻ ra ngoài"],
    sensitive: ["Nhóm nhạy cảm nên ở trong nhà", "Đeo khẩu trang N95 nếu ra ngoài", "Theo dõi sát triệu chứng, liên hệ bác sĩ khi cần"],
  },
  very_unhealthy: {
    dos: ["Ở trong nhà, đóng kín cửa", "Dùng máy lọc không khí HEPA liên tục", "Theo dõi cảnh báo y tế địa phương"],
    avoid: ["Tránh mọi hoạt động ngoài trời", "Không tập thể dục ngoài trời", "Không để trẻ em ra ngoài"],
    sensitive: ["Nhóm nhạy cảm tuyệt đối ở trong nhà", "Khẩu trang N95 + kính bảo hộ khi ra ngoài", "Chuẩn bị sẵn thuốc, liên hệ y tế khi khó thở"],
  },
  hazardous: {
    dos: ["Trú trong nhà kín hoàn toàn", "Máy lọc HEPA chạy 24/24", "Theo dõi thông báo khẩn cấp"],
    avoid: ["Tuyệt đối không ra ngoài", "Không mở cửa trong mọi trường hợp", "Không vận động gắng sức kể cả trong nhà"],
    sensitive: ["Nguy cơ cao nhất với nhóm nhạy cảm", "Sơ tán tới nơi có không khí sạch nếu có thể", "Tìm hỗ trợ y tế ngay khi có triệu chứng"],
  },
  unknown: { dos: [], avoid: [], sensitive: [] },
};

const COLUMNS = [
  {
    key: "dos" as const,
    title: "Nên làm",
    Icon: Check,
    color: "hsl(142 58% 36%)",
    tint: "hsl(142 58% 36% / 0.12)",
  },
  {
    key: "avoid" as const,
    title: "Nên tránh",
    Icon: X,
    color: "hsl(16 100% 50%)",
    tint: "hsl(16 100% 50% / 0.12)",
  },
  {
    key: "sensitive" as const,
    title: "Nhóm nhạy cảm",
    Icon: AlertTriangle,
    color: "hsl(28 90% 46%)",
    tint: "hsl(28 90% 50% / 0.12)",
  },
];

export function HealthGuidance({ aqi }: Props) {
  const cat = getAqiCategory(aqi);
  if (cat.code === "unknown") return null;
  const guidance = GUIDANCE_BY_CATEGORY[cat.code];
  const { solid } = aqiColors(aqi);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="ow-card p-5 md:p-6"
    >
      <div className="flex items-center gap-2">
        <HeartPulse className="w-4 h-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">Hướng dẫn sức khoẻ</h2>
        <span
          className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ background: aqiColors(aqi).tint, color: solid }}
        >
          AQI {aqi} · {cat.label}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.key} className="rounded-xl border border-border/50 bg-card/60 p-4">
            <div className="flex items-center gap-2">
              <span className="flex w-8 h-8 items-center justify-center rounded-lg" style={{ background: col.tint }}>
                <col.Icon className="w-4 h-4" style={{ color: col.color }} strokeWidth={2.5} />
              </span>
              <h3 className="text-sm font-bold" style={{ color: col.color }}>
                {col.title}
              </h3>
            </div>
            <ul className="mt-3 space-y-2">
              {guidance[col.key].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 leading-snug">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full"
                    style={{ background: col.color }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Nhóm nhạy cảm</strong> gồm trẻ em, người cao tuổi, phụ nữ mang thai và
        người mắc bệnh hô hấp/tim mạch.
      </p>
    </motion.section>
  );
}

export default HealthGuidance;
