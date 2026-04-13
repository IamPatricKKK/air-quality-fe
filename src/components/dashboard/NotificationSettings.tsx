import { useState, useEffect } from 'react';
import { getUserPreferences, saveUserPreferences } from '@/api/profile';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Globe, MapPin, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ALL_REGIONS = ['Bắc Bộ', 'Bắc Trung Bộ', 'Nam Trung Bộ', 'Đông Nam Bộ', 'Tây Nam Bộ'];

export function NotificationSettings() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'all' | 'selected'>('all');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserPreferences(user.id).then((data) => {
      setMode(data.notificationMode === 'selected' ? 'selected' : 'all');
      setSelectedRegions(data.favoriteRegions || []);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserPreferences(user.id, {
        notificationMode: mode,
        favoriteRegions: selectedRegions,
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
