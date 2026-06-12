import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStations } from '@/hooks/useStations';
import { LandingHero } from '@/components/landing/LandingHero';
import { CoverageSection } from '@/components/landing/CoverageSection';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

/**
 * Trang giới thiệu dành cho người ĐÃ đăng nhập — dùng chung bộ component landing
 * nhưng đổi khung sang "đã đăng nhập": mọi CTA dẫn vào bảng điều khiển, không có
 * nút đăng ký. Khách chưa đăng nhập sẽ bị chuyển về trang Landing (/).
 */
export default function Intro() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: stations } = useStations();

  // Chưa đăng nhập → chuyển về trang Landing.
  useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [loading, user, navigate]);

  const activeStations = (stations ?? []).filter((s) => s.is_active);
  const cities = [...new Set(activeStations.map((s) => s.city).filter(Boolean))];

  const handleExplore = () => navigate('/home');

  // Tránh nháy nội dung trong lúc chờ chuyển hướng (khi chưa đăng nhập).
  if (!loading && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flow-root">
      <LandingHero
        onExplore={handleExplore}
        onRegister={handleExplore}
        heading={'Chào mừng trở lại,\ntheo dõi không khí ngay.'}
        subtitle="Mở bảng điều khiển để xem AQI, dự báo 24h và quản lý cảnh báo cho khu vực của bạn."
        primaryLabel="Vào bảng điều khiển"
        showRegister={false}
      />
      <CoverageSection
        stationCount={activeStations.length || undefined}
        cities={cities}
      />
      <div id="features" className="scroll-mt-24">
        <LandingFeatures />
      </div>
      <div id="how-it-works" className="scroll-mt-24">
        <HowItWorks />
      </div>
      <LandingCTA
        onExplore={handleExplore}
        onRegister={handleExplore}
        heading="Tiếp tục theo dõi khu vực của bạn"
        subtitle="Mở bảng điều khiển để xem chỉ số mới nhất, dự báo và cảnh báo cá nhân hoá."
        secondaryLabel="Mở bảng điều khiển"
        showRegister={false}
      />
      <LandingFooter onRegister={handleExplore} loggedIn />
    </div>
  );
}
