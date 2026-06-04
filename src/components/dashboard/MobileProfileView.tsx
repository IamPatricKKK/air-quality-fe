import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/hooks/useAuthModal';
import { User, Mail, MapPin, LogOut, Moon, Info, LogIn, UserPlus } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationSettings } from '@/components/dashboard/NotificationSettings';
import { getUserPreferences } from '@/api/profile';
import { motion } from 'framer-motion';

export function MobileProfileView() {
  const { user, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [locationShared, setLocationShared] = useState<boolean | null>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getUserPreferences(user.id)
      .then((prefs) => {
        if (!cancelled) {
          setLocationShared(Boolean(prefs.location?.lat && prefs.location?.lng));
        }
      })
      .catch(() => {
        if (!cancelled) setLocationShared(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

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
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Vị trí</span>
          </div>
          <span
            className={`text-xs ${
              locationShared === null
                ? 'text-muted-foreground'
                : locationShared
                  ? 'text-primary'
                  : 'text-muted-foreground'
            }`}
          >
            {locationShared === null ? '…' : locationShared ? 'Đã chia sẻ' : 'Chưa chia sẻ'}
          </span>
        </div>
      </motion.div>

      <NotificationSettings />

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
