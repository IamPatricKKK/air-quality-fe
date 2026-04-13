import { useAuth } from '@/hooks/useAuth';
import { User, Mail, MapPin, Bell, LogOut, Moon } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationSettings } from '@/components/dashboard/NotificationSettings';
import { motion } from 'framer-motion';

export function MobileProfileView() {
  const { user, signOut } = useAuth();

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
            {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
          <span className="text-xs text-primary">Đã chia sẻ</span>
        </div>
      </motion.div>

      <NotificationSettings />

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={signOut}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Đăng xuất</span>
      </motion.button>
    </div>
  );
}
