import { createPortal } from 'react-dom';
import { Bell, LogOut, User, Settings, MapPin, ChevronDown, Shield } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useNotifications } from '@/hooks/useNotifications';
import { useUnreadCount } from '@/hooks/useAlerts';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useState, useRef, useEffect } from 'react';

const REGIONS = [
  { value: '', label: 'Tất cả khu vực' },
  { value: 'Việt Nam', label: '🇻🇳 Việt Nam' },
  { value: 'Bắc Bộ', label: 'Bắc Bộ' },
  { value: 'Trung Bộ', label: 'Trung Bộ' },
  { value: 'Nam Bộ', label: 'Nam Bộ' },
  { value: 'Đông Nam Bộ', label: 'Đông Nam Bộ' },
  { value: 'Tây Nguyên', label: 'Tây Nguyên' },
  { value: 'Đồng bằng sông Cửu Long', label: 'ĐBSCL' },
];

interface HeaderProps {
  onToggleAlerts?: () => void;
  alertsOpen?: boolean;
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
}

export function Header({ selectedRegion = '', onRegionChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { data: notifications } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const { data: isAdmin } = useIsAdmin();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = unreadData?.count ?? notifications?.filter(n => !n.is_read).length ?? 0;
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/home';
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) setRegionOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLabel = REGIONS.find(r => r.value === selectedRegion)?.label || 'Tất cả khu vực';
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || '';
  const adminUrl = import.meta.env.VITE_AIR_QUALITY_ADMIN_URL;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="px-4 md:px-6 h-16 flex items-center justify-between"
    >
      <Logo size="md" />

      <div className="flex items-center gap-1.5">

        {/* Landing nav */}
        {isLanding && (
          <nav className="hidden md:flex items-center gap-0.5 mr-2">
            {[
              { href: '#features', label: 'Tính năng' },
              { href: '#how-it-works', label: 'Cách hoạt động' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center h-8 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-150"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/home"
              className="inline-flex items-center h-8 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-150"
            >
              Bản đồ AQI
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center h-8 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-150"
            >
              Giới thiệu
            </Link>
          </nav>
        )}

        {/* Region selector — /home only */}
        {isHome && onRegionChange && (
          <div ref={regionRef} className="relative hidden md:block">
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/70 transition-all duration-150"
            >
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              <span className="max-w-[130px] truncate">{currentLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${regionOpen ? 'rotate-180' : ''}`} />
            </button>

            {regionOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-popover border border-border rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                {REGIONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => { onRegionChange(r.value); setRegionOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      selectedRegion === r.value
                        ? 'text-primary font-semibold bg-primary/6'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live indicator — /home only */}
        {isHome && (
          <div className="hidden lg:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold"
            style={{
              background: 'hsl(16 100% 60% / 0.10)',
              color: 'hsl(16 100% 50%)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(16 100% 52%)' }} />
            Trực tiếp
          </div>
        )}

        {/* About — not on landing */}
        {!isLanding && (
          <button
            onClick={() => navigate('/')}
            className="hidden md:inline-flex items-center h-8 px-3 rounded-lg bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-150"
          >
            Giới thiệu
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={() => {
            if (!user) {
              toast.info('Đăng nhập để xem thông báo và cảnh báo', {
                action: { label: 'Đăng nhập', onClick: openAuthModal },
              });
              return;
            }
            setAlertsOpen(o => !o);
          }}
          className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 ${
            alertsOpen
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/70'
          }`}
          title="Thông báo"
        >
          <Bell className="w-[17px] h-[17px]" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
              style={{ background: 'hsl(16 100% 52%)' }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <ThemeToggle />

        {/* Auth CTA */}
        {!user && (
          <button
            onClick={openAuthModal}
            className="vn-btn-gradient inline-flex items-center h-8 px-4 rounded-full text-sm font-semibold ml-0.5"
          >
            Đăng nhập
          </button>
        )}

        {/* User dropdown */}
        {user && (
          <div ref={userRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="inline-flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/70 transition-all duration-150"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-primary-foreground text-[10px] font-bold"
                style={{ background: 'hsl(201 100% 14%)' }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="hidden md:block text-sm font-medium truncate max-w-[110px]">{displayName}</span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-popover border border-border rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                <div className="px-3 py-2.5 mb-1 border-b border-border/60">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>

                {[
                  { icon: User, label: 'Trang cá nhân', onClick: () => { setUserMenuOpen(false); navigate('/profile'); } },
                  { icon: Settings, label: 'Cài đặt tài khoản', onClick: () => { setUserMenuOpen(false); navigate('/profile/settings'); } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {item.label}
                  </button>
                ))}

                {isAdmin && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (adminUrl) { window.location.href = adminUrl; } else { navigate('/home'); }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    Trang quản trị
                  </button>
                )}

                <div className="my-1 border-t border-border/60" />

                <button
                  onClick={() => { setUserMenuOpen(false); setLogoutConfirm(true); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/8 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={logoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc muốn đăng xuất khỏi tài khoản?"
        confirmLabel="Đăng xuất"
        cancelLabel="Huỷ"
        onConfirm={() => { setLogoutConfirm(false); signOut(); }}
        onCancel={() => setLogoutConfirm(false)}
      />

      {createPortal(
        <>
          <AlertPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
          {alertsOpen && (
            <div
              className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
              onClick={() => setAlertsOpen(false)}
            />
          )}
        </>,
        document.body,
      )}
    </motion.header>
  );
}
