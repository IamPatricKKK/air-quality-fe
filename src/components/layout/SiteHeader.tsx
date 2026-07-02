import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { Logo } from '@/components/Logo';
import { Header } from '@/components/dashboard/Header';

/** Pages whose first section is a full-screen video hero → header overlays it. */
const OVERLAY_PATHS = ['/', '/intro'];

/** Marketing nav (landing/intro): section anchors + real routes. */
const OVERLAY_NAV = [
  { label: 'Tính năng', href: '#features' },
  { label: 'Cách hoạt động', href: '#how-it-works' },
  { label: 'Bản đồ', to: '/home' },
];

/**
 * One site-wide header for every page: the SAME navy liquid-glass island, the
 * SAME scroll-dock shrink/expand effect, and the SAME Logo everywhere. Only the
 * inner content differs by context (marketing nav + CTA on landing/intro; full
 * dashboard controls on app pages).
 */
export function SiteHeader() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  if (pathname.startsWith('/auth')) return null;

  const overlay = OVERLAY_PATHS.includes(pathname);

  if (isMobile) {
    return <MobileBar overlay={overlay} />;
  }

  return (
    <NavyIsland overlay={overlay}>
      {overlay ? <MarketingBar /> : <Header />}
    </NavyIsland>
  );
}

/**
 * Shared navy-glass shell with the home scroll-dock effect. `fixed` over the
 * video hero (landing/intro) so the video stays full-screen; `sticky` on app
 * pages so it reserves space above the content.
 */
function NavyIsland({ overlay, children }: { overlay: boolean; children: ReactNode }) {
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setDocked(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const p = docked ? 1 : 0;
  const EASE = '2s cubic-bezier(0.22, 1, 0.36, 1)';
  const posCls = overlay ? 'fixed inset-x-0 top-0' : 'sticky top-0';

  return (
    <div className={`${posCls} z-50 px-6 md:px-12 lg:px-16`} style={{ paddingTop: 10 + 10 * p, transition: `padding-top ${EASE}` }}>
      <div
        className="liquid-glass mx-auto rounded-2xl will-change-transform"
        style={{
          maxWidth: 1700 - 200 * p,                       // shrink width when docked
          background: `rgba(0, 48, 73, ${0.55 + 0.37 * p})`, // navy, more opaque when docked
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.12), 0 ${8 + 16 * p}px ${24 + 36 * p}px ${-12 + 6 * p}px rgba(0,0,0,${0.25 + 0.3 * p})`,
          transform: `scale(${1 - 0.012 * p})`,
          transformOrigin: 'top center',
          transition: `max-width ${EASE}, background ${EASE}, box-shadow ${EASE}, transform ${EASE}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Marketing content (landing/intro): Logo + nav + auth CTA, on the navy bar. */
function MarketingBar() {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  const cta = user
    ? { label: 'Bảng điều khiển', onClick: () => navigate('/home') }
    : { label: 'Đăng nhập', onClick: openAuthModal };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-4 md:px-6 h-16"
    >
      <Logo size="md" tone="light" />

      <nav className="hidden items-center gap-8 md:flex">
        {OVERLAY_NAV.map((l) =>
          l.href ? (
            <a key={l.label} href={l.href} className="text-sm text-white/85 transition-colors hover:text-white">
              {l.label}
            </a>
          ) : (
            <Link key={l.label} to={l.to!} className="text-sm text-white/85 transition-colors hover:text-white">
              {l.label}
            </Link>
          ),
        )}
      </nav>

      <button
        onClick={cta.onClick}
        className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
      >
        {cta.label}
      </button>
    </motion.div>
  );
}

/** Compact navy bar for mobile (no scroll-dock). */
function MobileBar({ overlay }: { overlay: boolean }) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const toggleTheme = useThemeToggle();
  const posCls = overlay ? 'fixed inset-x-0 top-0' : 'sticky top-0';

  return (
    <div className={`${posCls} z-50 px-3 pt-3`}>
      <div
        className="liquid-glass mx-auto flex items-center justify-between rounded-2xl px-3 py-2"
        style={{ background: 'rgba(0, 48, 73, 0.8)' }}
      >
        <Logo size="sm" tone="light" />
        {overlay ? (
          <button
            onClick={user ? () => navigate('/home') : openAuthModal}
            className="rounded-lg bg-white px-4 py-1.5 text-xs font-medium text-black transition-colors hover:bg-gray-100"
          >
            {user ? 'Bảng điều khiển' : 'Đăng nhập'}
          </button>
        ) : (
          // Chỉ báo LIVE — đồng thời là gesture ẩn: chạm để đổi giao diện sáng/tối
          // (mobile không có nút theme trên header).
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Đổi giao diện sáng/tối"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-400/15 text-emerald-300 text-[10px] font-semibold tracking-wide active:scale-95 transition-transform"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </button>
        )}
      </div>
    </div>
  );
}
