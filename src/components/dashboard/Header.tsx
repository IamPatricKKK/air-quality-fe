import { createPortal } from 'react-dom';
import { Bell, LogOut, User, Settings, MapPin, ChevronDown, Info } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/home';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLabel = REGIONS.find(r => r.value === selectedRegion)?.label || 'Tất cả khu vực';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card px-6 py-4 flex items-center justify-between"
    >
      <Logo size="md" />

      <div className="flex items-center gap-3">
        {/* Region selector — only on /home */}
        {isHome && onRegionChange && (
          <div ref={regionRef} className="relative hidden md:block">
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="max-w-[140px] truncate">{currentLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${regionOpen ? 'rotate-180' : ''}`} />
            </button>
            {regionOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
                {REGIONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => { onRegionChange(r.value); setRegionOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                      selectedRegion === r.value ? 'text-primary font-medium bg-primary/5' : 'text-foreground'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          title="Giới thiệu"
        >
          <Info className="w-3.5 h-3.5" />
          Giới thiệu
        </button>

        {isHome && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Đang cập nhật trực tiếp
          </div>
        )}

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
          className={`relative p-2.5 rounded-lg transition-colors ${
            alertsOpen ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <ThemeToggle />

        {!user && (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <User className="w-4 h-4" />
            Đăng nhập
          </button>
        )}

        {user && (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  const adminUrl = import.meta.env.VITE_AIR_QUALITY_ADMIN_URL;
                  if (adminUrl) {
                    window.location.href = adminUrl;
                    return;
                  }
                  navigate('/home');
                }}
                className="p-2.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{user.email}</span>
            </button>
            <button
              onClick={() => setLogoutConfirm(true)}
              className="p-2.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
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
