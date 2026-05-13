import { useState, useEffect } from 'react';
import { getUserPreferences, saveUserPreferences } from '@/api/profile';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellRing, Globe, MapPin, Check, Smartphone, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ALL_REGIONS = ['Bắc Bộ', 'Bắc Trung Bộ', 'Nam Trung Bộ', 'Đông Nam Bộ', 'Tây Nam Bộ'];

export function NotificationSettings() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'all' | 'selected'>('all');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [quietEnabled, setQuietEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [saving, setSaving] = useState(false);
  const push = usePushNotifications();

  useEffect(() => {
    if (!user) return;
    getUserPreferences(user.id).then((data) => {
      setMode(data.notificationMode === 'selected' ? 'selected' : 'all');
      setSelectedRegions(data.favoriteRegions || []);
      setQuietEnabled(Boolean(data.quietHoursEnabled));
      if (typeof data.quietHoursStartMin === 'number') {
        const h = Math.floor(data.quietHoursStartMin / 60);
        const m = data.quietHoursStartMin % 60;
        setQuietStart(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
      if (typeof data.quietHoursEndMin === 'number') {
        const h = Math.floor(data.quietHoursEndMin / 60);
        const m = data.quietHoursEndMin % 60;
        setQuietEnd(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    });
  }, [user]);

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserPreferences(user.id, {
        notificationMode: mode,
        favoriteRegions: selectedRegions,
        quietHoursEnabled: quietEnabled,
        quietHoursStartMin: timeToMinutes(quietStart),
        quietHoursEndMin: timeToMinutes(quietEnd),
      });
      toast.success('Đã lưu cài đặt thông báo');
    } catch {
      toast.error('Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const handleTogglePush = async () => {
    try {
      if (push.subscribed) {
        await push.disable();
        toast.success('Đã tắt thông báo đẩy');
      } else {
        await push.enable();
        toast.success('Đã bật thông báo đẩy trên thiết bị này');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không bật được thông báo đẩy';
      toast.error(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Cài đặt thông báo</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Push toggle */}
        {push.status !== 'unsupported' && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <Smartphone className={`w-5 h-5 flex-shrink-0 ${push.subscribed ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Thông báo đẩy</p>
              <p className="text-xs text-muted-foreground">
                {push.status === 'denied'
                  ? 'Quyền đã bị từ chối — bật lại trong cài đặt trình duyệt.'
                  : push.subscribed
                    ? 'Nhận cảnh báo trên thiết bị này.'
                    : 'Cài lên home screen để nhận cảnh báo realtime.'}
              </p>
            </div>
            <button
              onClick={handleTogglePush}
              disabled={push.busy || push.status === 'denied'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                push.subscribed
                  ? 'bg-primary/10 text-primary'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              {push.busy ? '...' : push.subscribed ? 'Đang bật' : 'Bật'}
            </button>
          </div>
        )}

        {/* Mode selection */}
        <div className="space-y-2">
          <button
            onClick={() => setMode('all')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
              mode === 'all'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <Globe className={`w-5 h-5 flex-shrink-0 ${mode === 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Tất cả khu vực</p>
              <p className="text-xs text-muted-foreground">Nhận cảnh báo hàng ngày cho toàn bộ khu vực</p>
            </div>
            {mode === 'all' && <Check className="w-4 h-4 text-primary" />}
          </button>

          <button
            onClick={() => setMode('selected')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
              mode === 'selected'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <MapPin className={`w-5 h-5 flex-shrink-0 ${mode === 'selected' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Khu vực quan tâm</p>
              <p className="text-xs text-muted-foreground">Chỉ nhận cảnh báo cho khu vực đã chọn</p>
            </div>
            {mode === 'selected' && <Check className="w-4 h-4 text-primary" />}
          </button>
        </div>

        {/* Region selection */}
        {mode === 'selected' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground font-medium">Chọn khu vực quan tâm:</p>
            <div className="flex flex-wrap gap-2">
              {ALL_REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedRegions.includes(region)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quiet hours */}
        <div className="p-3 rounded-lg border border-border space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Moon className={`w-5 h-5 ${quietEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium text-foreground">Giờ yên tĩnh</p>
                <p className="text-xs text-muted-foreground">Không gửi push trong khung giờ này</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={quietEnabled}
              onChange={(e) => setQuietEnabled(e.target.checked)}
              className="w-4 h-4"
            />
          </label>

          {quietEnabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Bắt đầu</label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-secondary rounded-md text-xs text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Kết thúc</label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-secondary rounded-md text-xs text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </motion.div>
  );
}
