import { Link } from 'react-router-dom';
import { AnimatedHeading } from '@/components/landing/AnimatedHeading';
import { FadeIn } from '@/components/landing/FadeIn';

interface LandingHeroProps {
  onExplore: () => void;
  onRegister: () => void;
}

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

/** Center nav: real routes (no dead links). */
const NAV_LINKS = [
  { label: 'Bản đồ', to: '/home' },
  { label: 'Giới thiệu', to: '/about' },
];

/**
 * Full-screen video hero: raw background video (no overlay), a liquid-glass
 * navbar at the top, and bottom-anchored content with a staggered character
 * reveal on the headline and fade-ins on the supporting elements.
 */
export function LandingHero({ onExplore, onRegister }: LandingHeroProps) {
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
        {/* Navbar */}
        <div className="px-6 pt-6 md:px-12 lg:px-16">
          <nav className="liquid-glass flex items-center justify-between rounded-xl px-4 py-2">
            <Link to="/" aria-label="Air Quality VN" className="inline-flex items-center no-underline group">
              <img
                src="/logo.png"
                alt="Air Quality VN"
                className="h-12 w-auto rounded-lg object-contain shadow-sm transition-transform duration-200 group-hover:scale-[1.03]"
              />
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((l) =>
                l.href ? (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-sm text-white/90 transition-colors hover:text-gray-300"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.label}
                    to={l.to!}
                    className="text-sm text-white/90 transition-colors hover:text-gray-300"
                  >
                    {l.label}
                  </Link>
                ),
              )}
            </div>

            <button
              onClick={onRegister}
              className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
            >
              Đăng nhập
            </button>
          </nav>
        </div>

        {/* Bottom-anchored content */}
        <div className="flex flex-1 flex-col justify-end px-6 pb-12 md:px-12 lg:grid lg:grid-cols-2 lg:items-end lg:px-16 lg:pb-16">
          {/* Left column */}
          <div>
            <AnimatedHeading
              text={'Thở khỏe mỗi ngày\nvới dữ liệu thời gian thực.'}
              className="mb-4 text-4xl font-normal md:text-5xl lg:text-6xl xl:text-7xl"
            />

            <FadeIn delay={800} duration={1000}>
              <p className="mb-5 max-w-xl text-base text-gray-300 md:text-lg">
                Theo dõi AQI, PM2.5 và cảnh báo ô nhiễm theo thời gian thực cho mọi khu vực trên
                toàn quốc.
              </p>
            </FadeIn>

            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onExplore}
                  className="rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-gray-100"
                >
                  Tham quan ngay
                </button>
                <button
                  onClick={onRegister}
                  className="liquid-glass rounded-lg border border-white/20 px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black"
                >
                  Đăng ký tài khoản
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Right column — tag */}
          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass rounded-xl border border-white/20 px-6 py-3">
                <span className="text-lg font-light md:text-xl lg:text-2xl">
                  Thời gian thực. Cảnh báo. Dự báo.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
