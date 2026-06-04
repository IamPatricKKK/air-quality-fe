import { useNavigate } from 'react-router-dom';
import { BarChart3, Bell, MapPin, Shield, Smartphone, ArrowRight, UserPlus } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuthModal } from '@/hooks/useAuthModal';
import { motion } from 'framer-motion';

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

export default function Landing() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  const handleExplore = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <ArrowRight className="w-4 h-4" />
                Tham quan ngay
              </button>
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors"
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
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground text-center mb-8">
          Bạn có thể làm gì?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="glass-card p-5 space-y-2"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="glass-card p-6 md:p-8 text-center space-y-4">
          <h2 className="text-lg md:text-xl font-display font-bold text-foreground">
            Bắt đầu theo dõi chất lượng không khí ngay
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Đăng ký miễn phí để nhận cảnh báo cá nhân, ghim trạm yêu thích, và so sánh dữ liệu giữa các khu vực.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Đăng ký miễn phí
            </button>
            <button
              onClick={handleExplore}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Hoặc xem thử không cần tài khoản
            </button>
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
