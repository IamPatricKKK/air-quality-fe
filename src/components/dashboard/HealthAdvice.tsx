import { motion } from "framer-motion";
import { Activity, Heart, Shield, Wind } from "lucide-react";
import { getAqiCategory, type AqiCategoryCode } from "@/lib/aqi";

interface HealthAdviceProps {
  aqi: number | null | undefined;
}

interface GroupAdvice {
  outdoor: string;
  exercise: string;
  mask: string;
  windows: string;
}

const ADVICE_BY_CATEGORY: Record<AqiCategoryCode, {
  general: GroupAdvice;
  sensitive: GroupAdvice;
}> = {
  good: {
    general: {
      outdoor: "Thoải mái hoạt động ngoài trời",
      exercise: "Tập thể dục bình thường",
      mask: "Không cần đeo khẩu trang",
      windows: "Mở cửa sổ thông thoáng",
    },
    sensitive: {
      outdoor: "An toàn cho mọi hoạt động",
      exercise: "Tập thể dục bình thường",
      mask: "Không cần đeo khẩu trang",
      windows: "Mở cửa sổ thông thoáng",
    },
  },
  moderate: {
    general: {
      outdoor: "Thoải mái hoạt động ngoài trời",
      exercise: "Tập thể dục bình thường",
      mask: "Không cần đeo khẩu trang",
      windows: "Mở cửa sổ vẫn ổn",
    },
    sensitive: {
      outdoor: "Hạn chế hoạt động kéo dài ngoài trời",
      exercise: "Giảm cường độ tập luyện",
      mask: "Cân nhắc đeo khẩu trang khi ra ngoài lâu",
      windows: "Đóng cửa sổ khi ngủ",
    },
  },
  unhealthy_sensitive: {
    general: {
      outdoor: "Hoạt động ngoài trời vẫn ổn",
      exercise: "Giảm cường độ tập luyện ngoài trời",
      mask: "Cân nhắc khẩu trang khi đường đông",
      windows: "Đóng cửa sổ giờ cao điểm",
    },
    sensitive: {
      outdoor: "Hạn chế ra ngoài",
      exercise: "Tránh tập thể dục ngoài trời",
      mask: "Đeo khẩu trang N95 khi ra ngoài",
      windows: "Đóng cửa sổ, bật máy lọc không khí",
    },
  },
  unhealthy: {
    general: {
      outdoor: "Hạn chế hoạt động ngoài trời kéo dài",
      exercise: "Tránh tập thể dục ngoài trời",
      mask: "Đeo khẩu trang khi ra ngoài",
      windows: "Đóng cửa sổ, bật máy lọc",
    },
    sensitive: {
      outdoor: "Tránh ra ngoài nếu không cần",
      exercise: "Tập trong nhà",
      mask: "Bắt buộc khẩu trang N95",
      windows: "Đóng kín cửa, bật máy lọc",
    },
  },
  very_unhealthy: {
    general: {
      outdoor: "Tránh hoạt động ngoài trời",
      exercise: "Chỉ tập trong nhà",
      mask: "Bắt buộc khẩu trang N95 khi ra ngoài",
      windows: "Đóng kín cửa, máy lọc bật 24/24",
    },
    sensitive: {
      outdoor: "Ở trong nhà",
      exercise: "Nghỉ tập",
      mask: "Khẩu trang N95 + kính bảo hộ",
      windows: "Đóng kín tuyệt đối, máy lọc HEPA",
    },
  },
  hazardous: {
    general: {
      outdoor: "Khẩn cấp — ở trong nhà",
      exercise: "Tuyệt đối không tập ngoài trời",
      mask: "Khẩu trang N95 ngay cả khi ra cửa",
      windows: "Đóng kín, dán băng dính khe cửa nếu cần",
    },
    sensitive: {
      outdoor: "KHẨN CẤP — không ra ngoài",
      exercise: "Nghỉ tập hoàn toàn",
      mask: "Khẩu trang N95 + kính bảo hộ",
      windows: "Đóng kín tuyệt đối, dùng máy lọc HEPA",
    },
  },
  unknown: {
    general: {
      outdoor: "Chưa có khuyến nghị",
      exercise: "Chưa có khuyến nghị",
      mask: "Chưa có khuyến nghị",
      windows: "Chưa có khuyến nghị",
    },
    sensitive: {
      outdoor: "Chưa có khuyến nghị",
      exercise: "Chưa có khuyến nghị",
      mask: "Chưa có khuyến nghị",
      windows: "Chưa có khuyến nghị",
    },
  },
};

export function HealthAdvice({ aqi }: HealthAdviceProps) {
  const cat = getAqiCategory(aqi);
  const advice = ADVICE_BY_CATEGORY[cat.code];

  if (cat.code === "unknown") return null;

  const rows: Array<{ icon: typeof Wind; label: string; key: keyof GroupAdvice }> = [
    { icon: Wind, label: "Ngoài trời", key: "outdoor" },
    { icon: Activity, label: "Vận động", key: "exercise" },
    { icon: Shield, label: "Khẩu trang", key: "mask" },
    { icon: Heart, label: "Cửa sổ / máy lọc", key: "windows" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: `${cat.color}22` }}
      >
        <div
          className="w-2 h-8 rounded-sm"
          style={{ backgroundColor: cat.color }}
        />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Khuyến nghị sức khoẻ</h3>
          <p className="text-[11px] text-muted-foreground">
            AQI {aqi ?? "—"} · {cat.label}
          </p>
        </div>
      </div>

      <div className="p-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Người khoẻ mạnh
          </p>
          <ul className="space-y-1.5">
            {rows.map((row) => (
              <li key={row.key} className="flex items-start gap-2 text-xs">
                <row.icon className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground">{row.label}: </span>
                  <span className="text-foreground">{advice.general[row.key]}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: cat.color }}>
            Nhóm nhạy cảm
          </p>
          <ul className="space-y-1.5">
            {rows.map((row) => (
              <li key={row.key} className="flex items-start gap-2 text-xs">
                <row.icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: cat.color }} />
                <div>
                  <span className="text-muted-foreground">{row.label}: </span>
                  <span className="text-foreground">{advice.sensitive[row.key]}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Nhóm nhạy cảm</strong> bao gồm trẻ em, người già, phụ nữ mang thai,
        và người mắc bệnh hô hấp/tim mạch.
      </div>
    </motion.div>
  );
}
