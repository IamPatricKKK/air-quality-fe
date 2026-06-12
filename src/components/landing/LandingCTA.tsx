import { UserPlus } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

interface LandingCTAProps {
  onExplore: () => void;
  onRegister: () => void;
  heading?: string;
  subtitle?: string;
  /** Filled register button label. */
  primaryLabel?: string;
  /** Outline explore button label. */
  secondaryLabel?: string;
  /** Hide the register button (logged-in users). */
  showRegister?: boolean;
}

export function LandingCTA({
  onExplore,
  onRegister,
  heading = 'Bắt đầu theo dõi chất lượng không khí ngay',
  subtitle = 'Đăng ký miễn phí để nhận cảnh báo cá nhân, ghim trạm yêu thích, và so sánh dữ liệu giữa các khu vực.',
  primaryLabel = 'Đăng ký miễn phí',
  secondaryLabel = 'Hoặc xem thử không cần tài khoản',
  showRegister = true,
}: LandingCTAProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <Reveal>
        <div className="cta-gradient relative overflow-hidden rounded-3xl p-8 md:p-16 text-center">
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative space-y-4">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white">
              {heading}
            </h2>
            <p className="text-sm md:text-base text-white/85 max-w-lg mx-auto">
              {subtitle}
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              {showRegister && (
                <button
                  onClick={onRegister}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-foreground font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg shadow-black/10 w-full sm:w-auto justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  {primaryLabel}
                </button>
              )}
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 text-white font-semibold text-sm border border-white/30 hover:bg-white/25 transition-colors w-full sm:w-auto justify-center"
              >
                {secondaryLabel}
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
