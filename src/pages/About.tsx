import type { ReactNode, CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Github,
  Mail,
  Gauge,
  TrendingUp,
  Bell,
  Map as MapIcon,
  Radio,
  BarChart3,
  Download,
  Smartphone,
  MapPin,
  Database,
  Globe,
  Layers,
  Cpu,
  Sparkles,
  GraduationCap,
  Wind,
  ShieldCheck,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Reveal } from "@/components/landing/Reveal";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════════════════
   DATA — toàn bộ thông tin được giữ nguyên, chỉ tổ chức lại
   ═══════════════════════════════════════════════════════════════ */

const METRICS = [
  { icon: MapPin, value: "42+", label: "Trạm quan trắc", sub: "trên toàn quốc" },
  { icon: Database, value: "4", label: "Nguồn dữ liệu", sub: "IQAir · Open-Meteo · OWM · WAQI" },
  { icon: TrendingUp, value: "24h", label: "Dự báo AI", sub: "Prophet & ARIMA" },
  { icon: Radio, value: "Realtime", label: "Giám sát", sub: "WebSocket, không refresh" },
];

const FEATURES = [
  { icon: Gauge, title: "Theo dõi AQI", desc: "AQI, PM2.5, nhiệt độ, độ ẩm từ 42+ trạm — hợp nhất dữ liệu 4 nguồn." },
  { icon: TrendingUp, title: "Dự báo AI", desc: "Dự báo 24 giờ tới bằng Prophet & ARIMA, phát hiện bất thường." },
  { icon: Bell, title: "Cảnh báo", desc: "In-app, email & Web Push cá nhân hoá — kèm giờ yên tĩnh." },
  { icon: MapIcon, title: "Bản đồ & Heatmap", desc: "Leaflet 3 chế độ: Trạm, Heatmap, Khu vực với AQI pins có số." },
  { icon: Radio, title: "Realtime", desc: "WebSocket — số liệu tự cập nhật, không cần tải lại trang." },
  { icon: BarChart3, title: "Phân tích sức khoẻ", desc: "Lịch sử 30 ngày, khuyến nghị 2 nhóm, phơi nhiễm cá nhân." },
  { icon: Download, title: "Xuất CSV", desc: "Tải lịch sử quan trắc để phân tích chuyên sâu." },
  { icon: Smartphone, title: "PWA", desc: "Cài như app, chạy offline, push như ứng dụng native." },
];

const TECH_GROUPS = [
  { icon: Layers, title: "Frontend", items: ["React 18", "TypeScript", "Vite 5", "Tailwind", "shadcn/ui", "TanStack Query", "Leaflet", "Recharts", "PWA"] },
  { icon: Cpu, title: "Backend", items: ["NestJS 11", "MikroORM 6", "Socket.IO", "Web Push (VAPID)", "FastAPI", "JWT RS256 + JWKS", "RBAC 4 vai trò", "Rate limiting"] },
  { icon: Database, title: "Database", items: ["PostgreSQL 16", "7 schemas", "BRIN time-series", "View fusion 4 nguồn"] },
  { icon: Globe, title: "Nguồn dữ liệu", items: ["IQAir AirVisual", "Open-Meteo", "OpenWeatherMap", "WAQI"] },
  { icon: Sparkles, title: "ML & Analytics", items: ["Prophet (Meta)", "ARIMA", "Linear Regression", "Anomaly (z-score + IQR)", "Seasonal analysis"] },
];

/* ═══════════════════════════════════════════════════════════════
   MOCKUP HELPERS — dựng UI bằng CSS/SVG thay cho ảnh screenshot
   ═══════════════════════════════════════════════════════════════ */

/** Màu theo ngưỡng AQI, dùng chung token thiết kế (tự thích ứng dark mode). */
function aqiHsl(v: number): string {
  if (v <= 50) return "hsl(var(--aqi-good))";
  if (v <= 100) return "hsl(var(--aqi-moderate))";
  if (v <= 150) return "hsl(var(--aqi-unhealthy-sensitive))";
  if (v <= 200) return "hsl(var(--aqi-unhealthy))";
  if (v <= 300) return "hsl(var(--aqi-very-unhealthy))";
  return "hsl(var(--aqi-hazardous))";
}

const GRID_BG: CSSProperties = {
  backgroundImage:
    "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
};

/** Khung trình duyệt giả lập (window chrome). */
function BrowserMock({ children, url = "airquality.vn" }: { children: ReactNode; url?: string }) {
  return (
    <div className="ow-card overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-secondary/40">
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(16 100% 60%)" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(43 88% 50%)" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(142 58% 44%)" }} />
        </span>
        <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 h-6 rounded-md bg-background/70 border border-border/50 text-[10px] text-muted-foreground">
          <Globe className="w-3 h-3" /> {url}
        </span>
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}

/** Pin AQI tròn có số, đặt tuyệt đối trên bản đồ giả lập. */
function AqiPin({ x, y, v, size = 28 }: { x: string; y: string; v: number; size?: number }) {
  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full text-white font-bold shadow-md ring-2 ring-white/80"
      style={{ left: x, top: y, width: size, height: size, fontSize: size * 0.36, background: aqiHsl(v) }}
    >
      {v}
    </span>
  );
}

function HeroDashboardMock() {
  const pins = [
    { x: "22%", y: "32%", v: 152 },
    { x: "54%", y: "20%", v: 93 },
    { x: "70%", y: "58%", v: 47 },
    { x: "38%", y: "70%", v: 118 },
    { x: "84%", y: "36%", v: 165 },
  ];
  return (
    <BrowserMock url="airquality.vn/home">
      <div className="p-3 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Map */}
        <div className="lg:col-span-2 relative h-44 md:h-64 rounded-xl overflow-hidden border border-border/60 bg-gradient-to-br from-secondary to-accent/30">
          <div className="absolute inset-0 opacity-40" style={GRID_BG} />
          {pins.map((p, i) => (
            <AqiPin key={i} {...p} />
          ))}
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 text-[9px] font-semibold text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(16 100% 52%)" }} /> Trực tiếp
          </span>
        </div>
        {/* Right column */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[{ l: "AQI TB", v: "93" }, { l: "Trạm", v: "57" }].map((s) => (
              <div key={s.l} className="ow-tile p-2.5">
                <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{s.l}</div>
                <div className="text-xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>
          <div className="ow-tile p-3">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dự báo 24h</div>
            <div className="flex items-end gap-1 h-16 md:h-24">
              {[40, 55, 48, 70, 62, 80, 58, 66].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ height: `${h}%`, background: "hsl(var(--primary))", opacity: 0.35 + (h / 100) * 0.6 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrowserMock>
  );
}

function MapMock() {
  const pins = [
    { x: "18%", y: "34%", v: 165 },
    { x: "46%", y: "22%", v: 88 },
    { x: "64%", y: "50%", v: 52 },
    { x: "32%", y: "64%", v: 124 },
    { x: "80%", y: "40%", v: 142 },
    { x: "56%", y: "78%", v: 71 },
  ];
  return (
    <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-secondary to-accent/30 shadow-sm">
      <div className="absolute inset-0 opacity-40" style={GRID_BG} />
      {pins.map((p, i) => (
        <AqiPin key={i} {...p} size={34} />
      ))}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-1.5">
        {[{ l: "Tốt", v: 30 }, { l: "TB", v: 80 }, { l: "Kém", v: 130 }, { l: "Xấu", v: 180 }].map((c) => (
          <span key={c.l} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background/85 text-[9px] font-semibold text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: aqiHsl(c.v) }} /> {c.l}
          </span>
        ))}
      </div>
    </div>
  );
}

function ForecastMock() {
  const pts = "0,80 40,70 80,84 120,58 160,66 200,40 240,52 280,30 320,38";
  return (
    <div className="ow-card p-5 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">Dự báo AQI · 24 giờ</div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(16 100% 60% / 0.12)", color: "hsl(16 100% 45%)" }}>
          Prophet
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-bold" style={{ color: aqiHsl(118), fontVariantNumeric: "tabular-nums" }}>
          118
        </span>
        <span className="text-xs text-muted-foreground">AQI dự kiến lúc cao điểm</span>
      </div>
      <svg viewBox="0 0 320 110" preserveAspectRatio="none" className="w-full h-28 mt-3">
        <defs>
          <linearGradient id="fcArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(203 39% 57%)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="hsl(203 39% 57%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${pts} 320,110 0,110`} fill="url(#fcArea)" />
        <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="280" cy="30" r="4" fill="hsl(16 100% 55%)" stroke="white" strokeWidth="2" />
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        {["Bây giờ", "+6h", "+12h", "+18h", "+24h"].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function CompareMock() {
  const cols = [
    { name: "Hà Nội", v: 152 },
    { name: "Đà Nẵng", v: 71 },
    { name: "TP.HCM", v: 98 },
  ];
  return (
    <div className="ow-card p-5 rounded-2xl">
      <div className="text-sm font-semibold text-foreground mb-4">So sánh trạm</div>
      <div className="grid grid-cols-3 gap-4 justify-items-center">
        {cols.map((c) => (
          <div key={c.name} className="flex flex-col items-center w-full">
            <div className="text-lg font-bold mb-1.5" style={{ color: aqiHsl(c.v), fontVariantNumeric: "tabular-nums" }}>
              {c.v}
            </div>
            <div className="relative w-9 md:w-12 h-36 rounded-lg bg-secondary/50 flex items-end overflow-hidden">
              <div className="w-full rounded-lg transition-all" style={{ height: `${(c.v / 180) * 100}%`, background: aqiHsl(c.v) }} />
            </div>
            <div className="text-[11px] mt-2 text-muted-foreground truncate max-w-full">{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const HEAT = [42, 58, 71, 66, 90, 112, 88, 54, 49, 63, 77, 101, 134, 120, 95, 82, 70, 58, 44, 52, 61, 73, 88, 104, 118, 142, 156, 130, 96, 84];

function AnalyticsMock() {
  return (
    <div className="ow-card p-5 rounded-2xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[{ l: "Phơi nhiễm", v: "3.2", u: "điếu/ngày" }, { l: "Trung bình 30N", v: "104", u: "AQI" }].map((s) => (
          <div key={s.l} className="ow-tile p-3">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{s.l}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{s.v}</span>
              <span className="text-[10px] text-muted-foreground">{s.u}</span>
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground mb-2">Lịch AQI · 30 ngày</div>
        <div className="grid grid-cols-10 gap-1.5">
          {HEAT.map((v, i) => (
            <span key={i} className="aspect-square rounded-[3px]" style={{ background: aqiHsl(v) }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const SHOWCASE = [
  { label: "Bản đồ", title: "Bản đồ AQI tương tác", desc: "Toàn bộ trạm trên một bản đồ Leaflet với pin hiển thị chỉ số trực tiếp. Chuyển nhanh giữa chế độ Trạm, Heatmap và Khu vực.", mock: <MapMock /> },
  { label: "Dự báo", title: "Dự báo 24 giờ bằng AI", desc: "Mô hình Prophet & ARIMA dự báo xu hướng AQI 24 giờ tới, kèm phát hiện bất thường để cảnh báo sớm.", mock: <ForecastMock /> },
  { label: "So sánh", title: "So sánh nhiều trạm", desc: "Đặt cạnh nhau tới 3 trạm để so sánh AQI, PM2.5 và xu hướng — chọn nơi trong lành nhất cho hôm nay.", mock: <CompareMock /> },
  { label: "Phân tích", title: "Bảng phân tích & lịch sử", desc: "Lịch heatmap 30 ngày, khuyến nghị sức khoẻ theo nhóm và ước tính phơi nhiễm cá nhân quy đổi.", mock: <AnalyticsMock /> },
];

/* ═══════════════════════════════════════════════════════════════
   SECTION LABEL — tiêu đề nhỏ phía trên mỗi mục
   ═══════════════════════════════════════════════════════════════ */
function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="text-center max-w-2xl mx-auto">
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">{eyebrow}</span>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h2>
      {sub && <p className="mt-4 text-base text-muted-foreground leading-relaxed">{sub}</p>}
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ── */}
      <section className="sky-hero relative overflow-hidden border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-12 pb-16 md:pb-24">
          <div className="md:hidden mb-6">
            <BackButton />
          </div>

          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-card/70 border border-border/60 text-muted-foreground backdrop-blur-sm">
              <Wind className="w-3.5 h-3.5 text-primary" />
              Phiên bản 0.1.0 · Giám sát môi trường
            </span>

            <h1 className="mt-5 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Chất lượng không khí Việt Nam,{" "}
              <span className="text-aqi-gradient">theo thời gian thực</span>
            </h1>

            <p className="mt-5 text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Hợp nhất dữ liệu từ 4 nguồn API, dự báo AI 24 giờ và cảnh báo đa kênh — cho hơn 42 trạm
              quan trắc trên toàn quốc.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-7 rounded-xl text-base shadow-lg shadow-primary/20">
                <Link to="/home">
                  Khám phá bản đồ <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 rounded-xl text-base bg-card/60 backdrop-blur-sm">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" /> Xem GitHub
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-12 md:mt-16">
            <HeroDashboardMock />
          </Reveal>
        </div>
      </section>

      {/* ── KEY METRICS ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.06}>
              <div className="ow-card h-full p-6 flex flex-col gap-1.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
                <div
                  className="font-bold text-foreground leading-none"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}
                >
                  {m.value}
                </div>
                <div className="text-sm font-semibold text-foreground mt-1">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <SectionHeading
          eyebrow="Tính năng"
          title="Mọi công cụ trong một nền tảng"
          sub="Theo dõi, dự báo, cảnh báo và bảo vệ sức khoẻ — tất cả trong một giao diện."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.06}>
              <div className="ow-card group h-full p-6 space-y-3 transition-transform duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <f.icon className="w-[22px] h-[22px] text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PRODUCT SHOWCASE ── */}
      <section className="bg-bg-section/60 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <SectionHeading eyebrow="Sản phẩm" title="Xem hệ thống hoạt động" />
          <div className="mt-14 space-y-16 md:space-y-24">
            {SHOWCASE.map((s, i) => {
              const reversed = i % 2 === 1;
              return (
                <Reveal key={s.title}>
                  <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className={reversed ? "lg:order-2" : ""}>
                      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                        {s.label}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{s.title}</h3>
                      <p className="mt-4 text-base text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                    <div className={reversed ? "lg:order-1" : ""}>{s.mock}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <SectionHeading eyebrow="Công nghệ" title="Được xây dựng trên nền tảng vững chắc" />
        <div className="mt-12 max-w-4xl mx-auto space-y-6">
          {TECH_GROUPS.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.04}>
              <div className="ow-card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 md:w-48 md:flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <g.icon className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{g.title}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── AUTHOR ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-12 md:pb-20">
        <Reveal className="max-w-3xl mx-auto">
          <div className="ow-card p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground flex-shrink-0"
              style={{ background: "hsl(201 100% 14%)" }}
            >
              PXT
            </div>
            <div className="flex-1">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-2">Tác giả</span>
              <h3 className="text-xl font-bold text-foreground">Phạm Xuân Trường</h3>
              <p className="text-sm text-muted-foreground mt-0.5">MSSV 64132786 · Lớp 64.CNTT-CLC · Khoá 2022–2026</p>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center justify-center sm:justify-start gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary/70" /> Đại học Nha Trang · Khoa CNTT
                </span>
                <span className="inline-flex items-center justify-center sm:justify-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary/70" /> GVHD: ThS. Mai Cường Thọ
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 bg-bg-section/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a
              href="mailto:letruongle325@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors"
            >
              <Mail className="w-4 h-4" /> Email
            </a>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium text-muted-foreground">
              <ShieldCheck className="w-4 h-4" /> Học thuật · MIT
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed md:text-right">
            Dữ liệu lấy từ API công cộng, chỉ mang tính tham khảo — không thay thế khuyến nghị chính thức
            từ cơ quan y tế. © 2026 Air Quality VN.
          </p>
        </div>
      </footer>
    </div>
  );
}
