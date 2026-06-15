import { useState, useEffect } from 'react';
import { getUserPreferences, saveUserPreferences } from '@/api/profile';
import { useAuth } from '@/hooks/useAuth';
import { MapPinned, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

function ToggleSwitch({ checked, disabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-secondary'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function NotificationPreferences() {
  const { user } = useAuth();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [locationShared, setLocationShared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);
  const [enablingLocation, setEnablingLocation] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = () => {
      getUserPreferences(user.id)
        .then((data) => {
          if (cancelled) return;
          setEmailEnabled(data.emailEnabled ?? true);
          setLocationShared(Boolean(data.location?.lat && data.location?.lng));
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    setLoading(true);
    load();
    // Nếu vị trí được lưu ở nơi khác (LocationPrompt, trang Tài khoản) → ẩn nút.
    window.addEventListener('location-saved', load);
    return () => {
      cancelled = true;
      window.removeEventListener('location-saved', load);
    };
  }, [user]);

  const handleToggleEmail = async (next: boolean) => {
    if (!user) return;
    setEmailEnabled(next); // optimistic
    setSavingEmail(true);
    try {
      await saveUserPreferences(user.id, { emailEnabled: next });
      toast.success('Đã lưu cài đặt', { duration: 1500 });
    } catch {
      setEmailEnabled(!next);
      toast.error('Lỗi khi lưu cài đặt');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleEnableLocation = async () => {
    if (!user) return;
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    setEnablingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      const { latitude: lat, longitude: lng } = position.coords;
      await saveUserPreferences(user.id, { location: { lat, lng }, dailyReportEnabled: true });
      setLocationShared(true); // ẩn nút
      window.dispatchEvent(new CustomEvent('location-saved'));
      toast.success('Đã bật thông báo chất lượng không khí nơi bạn sống thành công!');
    } catch {
      toast.error('Không lấy được vị trí. Vui lòng cho phép quyền vị trí trong trình duyệt rồi thử lại.');
    } finally {
      setEnablingLocation(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Đang tải cài đặt...
          </div>
        ) : (
          <>
            {/* Thông báo AQI nơi bạn sống — chỉ hiện nút khi CHƯA chia sẻ vị trí.
                Đã cấp quyền/đã chia sẻ → tự bật, ẩn nút. */}
            {!locationShared && (
              <button
                onClick={handleEnableLocation}
                disabled={enablingLocation}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left disabled:opacity-60"
              >
                {enablingLocation ? (
                  <Loader2 className="w-5 h-5 flex-shrink-0 text-primary animate-spin" />
                ) : (
                  <MapPinned className="w-5 h-5 flex-shrink-0 text-primary" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Nhận thông báo chất lượng không khí nơi bạn đang sống
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {enablingLocation
                      ? 'Đang lấy vị trí...'
                      : 'Bấm để cấp quyền vị trí và nhận báo cáo AQI khu vực của bạn lúc 6h sáng.'}
                  </p>
                </div>
              </button>
            )}

            {/* Nhận thông báo qua email */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <Mail
                className={`w-5 h-5 flex-shrink-0 ${emailEnabled ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Nhận thông báo qua email</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Gửi cảnh báo và báo cáo chất lượng không khí tới email của bạn.
                </p>
              </div>
              <ToggleSwitch
                checked={emailEnabled}
                disabled={savingEmail}
                onChange={() => handleToggleEmail(!emailEnabled)}
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
