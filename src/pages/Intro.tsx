import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Bell, MapPin, Shield, Smartphone, ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

// Trang giới thiệu dành cho người ĐÃ đăng nhập. UI/nội dung tạm sao y trang
// Landing — sẽ cập nhật nội dung riêng sau. (Landing là bản cho khách chưa đăng nhập.)
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

export default function Intro() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { user, loading } = useAuth();

  // Chưa đăng nhập → chuyển về trang Landing.
  useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleExplore = () => {
    navigate('/home');
  };

  // Tránh nháy nội dung trong lúc chờ chuyển hướng (khi chưa đăng nhập).
  if (!loading && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flow-root">
      {/* Hero — bleeds up behind the floating header so its mint gradient sits
          continuously under the glass bar (no two-tone seam). */}
      <div className="relative overflow-hidden sky-hero under-header">
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border/50 text-xs md:text-sm font-medium text-foreground shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                56 trạm quan trắc <span className="text-muted-foreground">•</span> Cập nhật mỗi 5 phút
              </span>
            </div>
            <div className="flex justify-center mb-6">
              <Logo size="lg" vertical />
            </div>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Hệ thống theo dõi chất lượng không khí thời gian thực trên toàn quốc.
              Xem chỉ số AQI, nhận cảnh báo ô nhiễm, dự báo 24h và lời khuyên sức khoẻ
              cho khu vực của bạn.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleExplore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-foreground/10"
              >
                Tham quan ngay
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card text-foreground font-semibold text-sm border border-border/60 hover:bg-secondary transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Đăng ký tài khoản
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
          Bạn có thể làm gì?
        </h2>
        <p className="mt-2.5 text-sm md:text-base text-muted-foreground text-center max-w-xl mx-auto">
          Một nền tảng — đầy đủ công cụ để theo dõi, cảnh báo và bảo vệ sức khoẻ.
        </p>
        <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="ow-card p-6 space-y-3 hover:-translate-y-0.5 transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center">
                <f.icon className="w-[22px] h-[22px] text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="cta-gradient relative overflow-hidden rounded-3xl p-8 md:p-14 text-center">
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative space-y-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              Bắt đầu theo dõi chất lượng không khí ngay
            </h2>
            <p className="text-sm md:text-base text-white/85 max-w-lg mx-auto">
              Đăng ký miễn phí để nhận cảnh báo cá nhân, ghim trạm yêu thích, và so sánh dữ liệu giữa các khu vực.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-foreground font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
              >
                <UserPlus className="w-4 h-4" />
                Đăng ký miễn phí
              </button>
              <button
                onClick={handleExplore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 text-white font-semibold text-sm border border-white/30 hover:bg-white/25 transition-colors"
              >
                Hoặc xem thử không cần tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 py-6 text-center">
        <p className="text-xs text-muted-foreground">
        Air Quality VN — Theo dõi chất lượng không khí Việt Nam
        </p>
      </div>
    </div>
  );
}
