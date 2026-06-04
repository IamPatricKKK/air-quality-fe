import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import {
  Github,
  Mail,
  Code,
  Database,
  Cpu,
  Layers,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const TECH_STACK = [
  {
    icon: Layers,
    title: "Frontend",
    items: ["React 18", "TypeScript", "Vite 5", "Tailwind + shadcn/ui", "TanStack Query", "Leaflet + Recharts", "PWA (Workbox)"],
  },
  {
    icon: Cpu,
    title: "Backend",
    items: ["NestJS 11", "MikroORM 6", "Socket.IO", "Web Push (VAPID)", "FastAPI (analytics)", "JWT RS256 + JWKS"],
  },
  {
    icon: Database,
    title: "Database",
    items: ["PostgreSQL 16", "7 schemas (catalog, ingest, core, iam, app, analytics, forecast)", "Time-series indexes (BRIN)", "View fusion 4 providers"],
  },
  {
    icon: Globe,
    title: "Data sources",
    items: ["IQAir AirVisual (priority 50)", "Open-Meteo (priority 100)", "OpenWeatherMap (priority 150)", "WAQI (priority 200)"],
  },
  {
    icon: Code,
    title: "ML & Analytics",
    items: ["Prophet (Meta)", "ARIMA (statsmodels)", "Linear Regression (scikit-learn)", "Anomaly detection (z-score + IQR)", "Seasonal pattern analysis"],
  },
];

const FEATURES = [
  "Theo dõi 42+ trạm trên toàn quốc với data fusion 4 providers",
  "Bản đồ Leaflet 3 chế độ (Trạm/Heatmap/Khu vực) + AQI pins có số",
  "Biểu đồ AQI 24h + dự báo Prophet 24h + lịch heatmap 30 ngày",
  "So sánh tới 3 trạm side-by-side",
  "Cảnh báo cá nhân hoá: in-app + email + Web Push",
  "Giờ yên tĩnh cho push notifications",
  "Khuyến nghị sức khoẻ chi tiết cho 2 nhóm",
  "Phơi nhiễm cá nhân (cigarette-equivalent)",
  "WebSocket realtime — không cần refresh",
  "PWA installable + offline mode",
  "Export CSV lịch sử quan trắc",
  "JWT RS256 + JWKS giữa 2 service · RBAC 4 vai trò · Rate limiting",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background p-3 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackButton />

      <div className="glass-card p-6 md:p-8 text-center space-y-4">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <p className="text-xs text-muted-foreground">
          Phiên bản 0.1.0
        </p>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="text-base font-semibold font-display text-foreground">Giới thiệu</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Chất Lượng Không Khí Việt Nam là hệ thống dashboard tổng hợp dữ liệu chất lượng không khí từ 4 nguồn API
          công cộng (IQAir, OpenWeatherMap, Open-Meteo, WAQI) cho khoảng 42 trạm quan trắc trải khắp
          Việt Nam. Hệ thống tích hợp các kỹ thuật phân tích chuỗi thời gian (Prophet, ARIMA, Linear
          Regression) để dự báo 24 giờ tới, phát hiện bất thường, đánh giá ảnh hưởng sức khoẻ, và gửi
          cảnh báo tự động đa kênh (in-app, email, Web Push) khi chỉ số ô nhiễm vượt ngưỡng người dùng
          thiết lập.
        </p>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="text-base font-semibold font-display text-foreground">Tính năng chính</h2>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-muted-foreground">
              <span className="text-primary mt-0.5">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold font-display text-foreground">Công nghệ sử dụng</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {TECH_STACK.map((stack) => (
            <div key={stack.title} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stack.icon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{stack.title}</h3>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {stack.items.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="text-base font-semibold font-display text-foreground">Tác giả</h2>
        <div className="text-sm space-y-1">
          <p className="text-foreground"><strong>Phạm Xuân Trường</strong> — MSSV 64132786</p>
          <p className="text-muted-foreground">Lớp 64.CNTT-CLC · Khóa 2022–2026</p>
          <p className="text-muted-foreground">Trường Đại học Nha Trang · Khoa Công nghệ Thông tin</p>
          <p className="text-muted-foreground mt-2">
            <strong>GVHD:</strong> ThS. Mai Cường Thọ
          </p>
        </div>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="text-base font-semibold font-display text-foreground">Liên hệ & License</h2>
        <div className="flex flex-wrap gap-3 text-xs">
          <a
            href="mailto:letruongle325@gmail.com"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80"
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80"
          >
            <Github className="w-3.5 h-3.5" /> GitHub
          </a>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Dự án phát triển cho mục đích học thuật. Dữ liệu lấy từ API công cộng; thông tin chỉ mang
          tính chất tham khảo, không thay thế cho khuyến nghị chính thức từ cơ quan y tế.
        </p>
      </div>
    </div>
  );
}
