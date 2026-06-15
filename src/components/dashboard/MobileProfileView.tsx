import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/hooks/useAuthModal';
import { User, Mail, MapPin, LogOut, Moon, Info, LogIn, UserPlus, Settings, ChevronRight, Loader2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationSettings } from '@/components/dashboard/NotificationSettings';
import { getUserPreferences, saveUserPreferences } from '@/api/profile';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function MobileProfileView() {
  const { user, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [locationShared, setLocationShared] = useState<boolean | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchLocation = () => {
      getUserPreferences(user.id)
        .then((prefs) => {
          if (!cancelled) {
            setLocationShared(Boolean(prefs.location?.lat && prefs.location?.lng));
          }
        })
        .catch(() => {
          if (!cancelled) setLocationShared(false);
        });
    };

    fetchLocation();

    // Re-fetch when LocationPrompt successfully saves coordinates.
    window.addEventListener('location-saved', fetchLocation);
    return () => {
      cancelled = true;
      window.removeEventListener('location-saved', fetchLocation);
    };
  }, [user]);

  const handleShareLocation = async () => {
    if (!user) return;
    setLocationBusy(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      const { latitude: lat, longitude: lng } = position.coords;
      await saveUserPreferences(user.id, { location: { lat, lng } });
      setLocationShared(true);
      window.dispatchEvent(new CustomEvent('location-saved'));
      toast.success('Đã chia sẻ vị trí. Bạn sẽ nhận thông báo chất lượng không khí hằng ngày.');
    } catch {
      toast.error('Không lấy được vị trí. Vui lòng cho phép quyền vị trí trong trình duyệt.');
    } finally {
      setLocationBusy(false);
    }
  };

  const handleUnshareLocation = async () => {
    if (!user) return;
    setLocationBusy(true);
    try {
      await saveUserPreferences(user.id, { location: null });
      setLocationShared(false);
      toast.success('Đã ngừng chia sẻ vị trí.');
    } catch {
      toast.error('Lỗi khi cập nhật vị trí.');
    } finally {
      setLocationBusy(false);
    }
  };

  const handleToggleLocation = () => {
    if (locationBusy || locationShared === null) return;
    if (locationShared) handleUnshareLocation();
    else handleShareLocation();
  };

  // Guest view — not logged in
  if (!user) {
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center space-y-3"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Chưa đăng nhập</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Đăng nhập để nhận cảnh báo ô nhiễm, ghim trạm yêu thích và cá nhân hoá trải nghiệm.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={openAuthModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </button>
            <button
              onClick={openAuthModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Đăng ký tài khoản
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card divide-y divide-border/50"
        >
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Giao diện tối</span>
            </div>
            <ThemeToggle />
          </div>
        </motion.div>

        <Link
          to="/"
          className="glass-card flex items-center justify-between px-4 py-3.5 hover:bg-secondary/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Giới thiệu</span>
          </div>
          <span className="text-xs text-muted-foreground">v0.1.0</span>
        </Link>
      </div>
    );
  }

  // Logged-in view
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground truncate">
            {user.user_metadata?.display_name || user.email?.split('@')[0]}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </motion.div>

      <Link
        to="/profile/settings"
        className="glass-card flex items-center justify-between px-4 py-3.5 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Cài đặt tài khoản</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card divide-y divide-border/50"
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Giao diện tối</span>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={handleToggleLocation}
          disabled={locationBusy || locationShared === null}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/20 transition-colors disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div className="text-left">
              <span className="text-sm text-foreground block">Vị trí</span>
              <span className="text-[11px] text-muted-foreground">
                {locationShared
                  ? 'Đang nhận thông báo khu vực của bạn'
                  : 'Chia sẻ để nhận thông báo khu vực của bạn'}
              </span>
            </div>
          </div>
          {locationBusy ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                locationShared === null
                  ? 'text-muted-foreground'
                  : locationShared
                    ? 'text-primary bg-primary/10'
                    : 'text-primary-foreground bg-primary'
              }`}
            >
              {locationShared === null ? '…' : locationShared ? 'Ngừng chia sẻ' : 'Chia sẻ'}
            </span>
          )}
        </button>
      </motion.div>

      <NotificationSettings />

      <Link
        to="/intro"
        className="glass-card flex items-center justify-between px-4 py-3.5 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Giới thiệu</span>
        </div>
        <span className="text-xs text-muted-foreground">v0.1.0</span>
      </Link>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => setLogoutConfirm(true)}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Đăng xuất</span>
      </motion.button>

      <ConfirmDialog
        open={logoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc muốn đăng xuất khỏi tài khoản?"
        confirmLabel="Đăng xuất"
        cancelLabel="Huỷ"
        onConfirm={() => { setLogoutConfirm(false); signOut(); }}
        onCancel={() => setLogoutConfirm(false)}
      />
    </div>
  );
}
