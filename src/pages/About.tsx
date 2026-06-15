import { BackButton } from "@/components/BackButton";
import {
  ShieldCheck,
  CalendarClock,
  HeartPulse,
  Bell,
  Mail,
  Wind,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Bảo vệ sức khoẻ",
    desc: "Biết khi nào không khí ô nhiễm để hạn chế ra ngoài, đeo khẩu trang và đóng cửa sổ đúng lúc.",
  },
  {
    icon: CalendarClock,
    title: "Chủ động lên kế hoạch",
    desc: "Dự báo 24 giờ tới giúp sắp xếp lịch tập thể dục, đi lại và các hoạt động ngoài trời hợp lý.",
  },
  {
    icon: HeartPulse,
    title: "Ưu tiên nhóm nhạy cảm",
    desc: "Khuyến nghị riêng cho trẻ em, người cao tuổi, phụ nữ mang thai và người mắc bệnh hô hấp, tim mạch.",
  },
  {
    icon: Bell,
    title: "Cảnh báo kịp thời",
    desc: "Nhận thông báo ngay khi chỉ số chất lượng không khí vượt ngưỡng an toàn tại khu vực bạn quan tâm.",
  },
];

const FEATURES = [
  "Theo dõi AQI, PM2.5, PM10, nhiệt độ, độ ẩm và gió theo thời gian thực từ 50+ trạm trên toàn quốc",
  "Bản đồ tương tác với 3 chế độ hiển thị: trạm quan trắc, heatmap và theo khu vực",
  "Dự báo chất lượng không khí 24 giờ tới bằng mô hình AI",
  "Lịch sử và xu hướng AQI trong 30 ngày",
  "Cảnh báo qua ứng dụng, email và push notification",
  "Khuyến nghị sức khoẻ chi tiết theo từng nhóm đối tượng",
  "Ước tính mức phơi nhiễm cá nhân (quy đổi tương đương điếu thuốc)",
  "Cài đặt như ứng dụng (PWA), hoạt động cả khi offline",
  "Cập nhật trực tiếp, không cần tải lại trang",
];

const AQI_SCALE = [
  { range: "0 – 50", label: "Tốt", cls: "bg-aqi-good", desc: "Chất lượng không khí tốt, không ảnh hưởng sức khoẻ." },
  { range: "51 – 100", label: "Trung bình", cls: "bg-aqi-moderate", desc: "Chấp nhận được; nhóm rất nhạy cảm nên chú ý." },
  { range: "101 – 150", label: "Không tốt cho nhóm nhạy cảm", cls: "bg-aqi-unhealthy-sensitive", desc: "Nhóm nhạy cảm có thể gặp triệu chứng." },
  { range: "151 – 200", label: "Không tốt", cls: "bg-aqi-unhealthy", desc: "Mọi người có thể bị ảnh hưởng tới sức khoẻ." },
  { range: "201 – 300", label: "Rất xấu", cls: "bg-aqi-very-unhealthy", desc: "Cảnh báo sức khoẻ nghiêm trọng cho tất cả." },
  { range: "301+", label: "Nguy hại", cls: "bg-aqi-hazardous", desc: "Tình trạng khẩn cấp; ảnh hưởng nghiêm trọng tới sức khoẻ." },
];

const DATA_SOURCES = [
  "IQAir AirVisual",
  "OpenWeatherMap",
  "Open-Meteo",
  "WAQI (World Air Quality Index)",
];

export default function About() {
  return (
    <div className="min-h-screen p-3 md:p-6 max-w-6xl mx-auto space-y-6">
      <BackButton />

      {/* Hero */}
      <div className="glass-card p-6 md:p-10 text-center space-y-4">
        <div className="flex justify-center">
          <Logo size="lg" vertical />
        </div>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Nền tảng theo dõi chất lượng không khí thời gian thực trên toàn quốc — giúp bạn nắm rõ
          mức độ ô nhiễm xung quanh và chủ động bảo vệ sức khoẻ mỗi ngày.
        </p>
      </div>

      {/* Giới thiệu */}
      <div className="glass-card p-5 md:p-6 space-y-3">
        <h2 className="text-base md:text-lg font-semibold font-display text-foreground">Về dự án</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Air Quality VN tổng hợp dữ liệu quan trắc chất lượng không khí từ nhiều nguồn công khai và
          hợp nhất lại thành một bức tranh thống nhất, dễ theo dõi cho người dùng tại Việt Nam. Thay
          vì phải tra cứu rải rác ở nhiều nơi, bạn có thể xem chỉ số AQI, nồng độ bụi mịn PM2.5/PM10
          và các thông số thời tiết liên quan ở một chỗ duy nhất, cập nhật liên tục.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hệ thống còn ứng dụng các mô hình phân tích chuỗi thời gian để dự báo chất lượng không khí
          trong 24 giờ tới, phát hiện diễn biến bất thường và đưa ra khuyến nghị sức khoẻ phù hợp với
          từng nhóm đối tượng — giúp việc theo dõi ô nhiễm trở nên trực quan và hữu ích hơn.
        </p>
      </div>

      {/* Vì sao hữu ích */}
      <div className="space-y-3">
        <h2 className="text-base md:text-lg font-semibold font-display text-foreground">Website giúp ích gì cho bạn?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="glass-card p-5 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tính năng chính */}
      <div className="glass-card p-5 md:p-6 space-y-3">
        <h2 className="text-base md:text-lg font-semibold font-display text-foreground">Tính năng chính</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-muted-foreground">
              <span className="text-primary mt-0.5">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Thang đo AQI */}
      <div className="glass-card p-5 md:p-6 space-y-3">
        <h2 className="text-base md:text-lg font-semibold font-display text-foreground">Hiểu về chỉ số AQI</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          AQI (Air Quality Index) là chỉ số quy đổi mức độ ô nhiễm thành một con số dễ hiểu. Số càng
          cao thì không khí càng ô nhiễm và càng ảnh hưởng tới sức khoẻ.
        </p>
        <div className="space-y-2">
          {AQI_SCALE.map((a) => (
            <div key={a.range} className="flex items-center gap-3">
              <span className={`shrink-0 w-16 text-center text-xs font-semibold text-white py-1 rounded-md ${a.cls}`}>
                {a.range}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nguồn dữ liệu */}
      <div className="glass-card p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-primary" />
          <h2 className="text-base md:text-lg font-semibold font-display text-foreground">Nguồn dữ liệu</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dữ liệu được thu thập từ nhiều nguồn quan trắc công khai và hợp nhất để tăng độ phủ cũng như
          độ tin cậy:
        </p>
        <div className="flex flex-wrap gap-2">
          {DATA_SOURCES.map((s) => (
            <span key={s} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Liên hệ & lưu ý */}
      <div className="glass-card p-5 md:p-6 space-y-3">
        <h2 className="text-base md:text-lg font-semibold font-display text-foreground">Liên hệ</h2>
        <a
          href="mailto:letruongle325@gmail.com"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors"
        >
          <Mail className="w-3.5 h-3.5" /> letruongle325@gmail.com
        </a>
        <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
          Dữ liệu lấy từ các API công cộng và chỉ mang tính chất tham khảo, không thay thế cho khuyến
          nghị chính thức từ cơ quan y tế và môi trường.
        </p>
      </div>
    </div>
  );
}
