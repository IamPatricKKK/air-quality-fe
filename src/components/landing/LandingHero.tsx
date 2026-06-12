import { AnimatedHeading } from '@/components/landing/AnimatedHeading';
import { FadeIn } from '@/components/landing/FadeIn';

interface LandingHeroProps {
  onExplore: () => void;
  onRegister: () => void;
  /** Headline; use \n for line breaks. */
  heading?: string;
  subtitle?: string;
  /** Primary (filled) CTA label. */
  primaryLabel?: string;
  /** Show the secondary "Đăng ký tài khoản" CTA (hidden for logged-in users). */
  showRegister?: boolean;
  /** Right-side glass tag text. */
  tag?: string;
}

const DEFAULT_HEADING = 'Theo dõi chất lượng không khí ở khu vực của bạn';
const DEFAULT_SUBTITLE =
  'Theo dõi AQI, PM2.5 và cảnh báo ô nhiễm theo thời gian thực cho mọi khu vực trên toàn quốc.';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

/**
 * Full-screen video hero: raw background video (no overlay) with bottom-anchored
 * content — a staggered character reveal on the headline and fade-ins on the
 * supporting elements. The site-wide header (SiteHeader) overlays the navbar.
 */
export function LandingHero({
  onExplore,
  onRegister,
  heading = DEFAULT_HEADING,
  subtitle = DEFAULT_SUBTITLE,
  primaryLabel = 'Tham quan ngay',
  showRegister = true,
  tag = 'Thời gian thực. Cảnh báo. Dự báo.',
}: LandingHeroProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Raw background video — no dimming, no overlay */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={VIDEO_URL}
      />

      {/* Foreground */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Bottom-anchored content */}
        <div className="flex flex-1 flex-col justify-end px-6 pb-12 md:px-12 lg:grid lg:grid-cols-2 lg:items-end lg:px-16 lg:pb-16">
          {/* Left column */}
          <div>
            <AnimatedHeading
              text={heading}
              className="mb-4 text-4xl font-normal md:text-5xl lg:text-6xl xl:text-7xl"
            />

            <FadeIn delay={800} duration={1000}>
              <p className="mb-5 max-w-xl text-base text-gray-300 md:text-lg">
                {subtitle}
              </p>
            </FadeIn>

            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onExplore}
                  className="rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-gray-100"
                >
                  {primaryLabel}
                </button>
                {showRegister && (
                <button
                  onClick={onRegister}
                  className="liquid-glass rounded-lg border border-white/20 px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black"
                >
                  Đăng ký tài khoản
                </button>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Right column — tag */}
          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass rounded-xl border border-white/20 px-6 py-3">
                <span className="text-lg font-light md:text-xl lg:text-2xl">
                  {tag}
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
