import { useState, useEffect } from 'react';
import { MapPin, X, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserPreferences, saveUserPreferences } from '@/api/profile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LocationPromptProps {
  onLocationGranted?: (lat: number, lng: number) => void;
}

export function LocationPrompt({ onLocationGranted }: LocationPromptProps) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkLocation = async () => {
      const data = await getUserPreferences(user.id);

      if (!data.location?.lat || !data.location?.lng) {
        setTimeout(() => setVisible(true), 2000);
      }
    };
    checkLocation();
  }, [user]);

  const handleAllow = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;

      await saveUserPreferences(user.id, {
        location: { lat, lng },
      });

      onLocationGranted?.(lat, lng);
      toast.success('Đã lưu vị trí! Bạn sẽ nhận thông báo chất lượng không khí hàng ngày.');
      setVisible(false);
    } catch (err: any) {
      if (err?.code === 1) {
        toast.error('Bạn đã từ chối chia sẻ vị trí. Bạn có thể bật lại trong cài đặt trình duyệt.');
      } else {
        toast.error('Không thể lấy vị trí. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
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
