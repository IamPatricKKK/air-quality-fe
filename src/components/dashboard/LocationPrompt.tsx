import { useState, useEffect, useCallback } from 'react';
import { MapPin, X, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveUserPreferences } from '@/api/profile';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/hooks/useAuthModal';
import { toast } from 'sonner';

interface LocationPromptProps {
  onLocationGranted?: (lat: number, lng: number) => void;
}

export function LocationPrompt({ onLocationGranted }: LocationPromptProps) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  /** Get position and optionally save to DB */
  const fetchAndSaveLocation = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      onLocationGranted?.(lat, lng);

      // Save to DB if logged in
      if (user) {
        await saveUserPreferences(user.id, { location: { lat, lng } }).catch(() => {});
      }

      return true;
    } catch {
      return false;
    }
  }, [user, onLocationGranted]);

  useEffect(() => {
    // Check browser geolocation permission
    const check = async () => {
      // Permissions API not available — fall back to prompt
      if (!navigator.permissions?.query) {
        setTimeout(() => setVisible(true), 2000);
        return;
      }

      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });

        if (status.state === 'granted') {
          // Permission already granted — silently get location
          fetchAndSaveLocation();
        } else if (status.state === 'prompt') {
          // Not yet asked — show our custom prompt
          const dismissed = sessionStorage.getItem('loc_dismissed');
          if (!dismissed) {
            setTimeout(() => setVisible(true), 2000);
          }
        }
        // 'denied' — don't show, user blocked it in browser settings

        // Listen for permission changes
        status.addEventListener('change', () => {
          if (status.state === 'granted') {
            setVisible(false);
            fetchAndSaveLocation();
          }
        });
      } catch {
        // Fallback for browsers that don't support geolocation permission query
        setTimeout(() => setVisible(true), 2000);
      }
    };

    check();
  }, [user, fetchAndSaveLocation]);

  const handleAllow = async () => {
    if (!user) {
      toast.info('Đăng nhập để lưu vị trí và nhận thông báo khu vực của bạn', {
        action: { label: 'Đăng nhập', onClick: openAuthModal },
      });
      setVisible(false);
      return;
    }

    setLoading(true);
    const ok = await fetchAndSaveLocation();
    setLoading(false);

    if (ok) {
      toast.success('Đã lưu vị trí! Bạn sẽ nhận thông báo chất lượng không khí hàng ngày.');
      setVisible(false);
    } else {
      toast.error('Bạn đã từ chối hoặc không thể lấy vị trí. Bạn có thể bật lại trong cài đặt trình duyệt.');
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('loc_dismissed', '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div className="glass-card p-4 shadow-2xl border border-primary/20">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground font-display">
                  Chia sẻ vị trí
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Cho phép truy cập vị trí để nhận thông báo chất lượng không khí khu vực bạn hàng ngày lúc 6h sáng.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAllow}
                    disabled={loading}
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {loading ? 'Đang lấy vị trí...' : 'Cho phép'}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 bg-secondary text-muted-foreground rounded-lg text-xs font-medium hover:text-foreground transition-colors"
                  >
                    Để sau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
