import { BarChart3, Bell, MapPin, Shield, Smartphone } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

/** Real platform features (copy preserved from the original landing page). */
const FEATURES = [
  {
    icon: BarChart3,
    title: 'Theo dõi thời gian thực',
    desc: 'Xem chỉ số AQI, PM2.5, nhiệt độ, độ ẩm từ 50+ trạm quan trắc trên toàn quốc, cập nhật liên tục.',
  },
  {
    icon: MapPin,
    title: 'Bản đồ trực quan',
    desc: 'Bản đồ tương tác với 3 chế độ hiển thị: trạm, heatmap, và khu vực. Dễ dàng tìm trạm gần bạn.',
  },
  {
    icon: Bell,
    title: 'Cảnh báo thông minh',
    desc: 'Nhận cảnh báo qua app, email, hoặc push notification khi chất lượng không khí vượt ngưỡng bạn đặt.',
  },
  {
    icon: Shield,
    title: 'Khuyến nghị sức khoẻ',
    desc: 'Lời khuyên chi tiết cho từng nhóm đối tượng dựa trên chỉ số AQI hiện tại tại khu vực của bạn.',
  },
  {
    icon: BarChart3,
    title: 'Dự báo & phân tích',
    desc: 'Dự báo chất lượng không khí 24 giờ tới bằng AI (Prophet, ARIMA). Lịch sử AQI 30 ngày.',
  },
  {
    icon: Smartphone,
    title: 'PWA - Cài đặt như app',
    desc: 'Cài đặt trực tiếp trên điện thoại, hoạt động offline, nhận push notification như ứng dụng native.',
  },
];

export function LandingFeatures() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <Reveal className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          Tính năng
        </span>
        <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground">
          Bạn có thể làm gì?
        </h2>
        <p className="mt-3 text-sm md:text-base text-muted-foreground">
          Một nền tảng — đầy đủ công cụ để theo dõi, cảnh báo và bảo vệ sức khoẻ.
        </p>
      </Reveal>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.08}>
            <div className="ow-card group h-full p-6 space-y-3 transition-transform duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                <f.icon className="w-[22px] h-[22px] text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
