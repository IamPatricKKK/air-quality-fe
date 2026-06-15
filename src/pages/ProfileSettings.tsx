import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BackButton } from '@/components/BackButton';
import { updateDisplayName, updatePassword } from '@/api/profile';
import { User, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const isOAuth = user?.user_metadata?.auth_provider !== 'local';

  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveName = async () => {
    if (!displayName.trim()) return toast.error('Tên hiển thị không được trống');
    setSavingName(true);
    try {
      const res = await updateDisplayName(displayName.trim());
      // Cập nhật ngay state user (state + localStorage) để header và mọi nơi
      // hiển thị tên mới mà không cần đăng xuất/đăng nhập lại.
      updateUser({ user_metadata: { display_name: res.displayName } });
      toast.success('Đã cập nhật tên hiển thị');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật');
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
    if (newPassword !== confirmPassword) return toast.error('Mật khẩu xác nhận không khớp');
    if (!isOAuth && !currentPassword) return toast.error('Vui lòng nhập mật khẩu hiện tại');

    setSavingPassword(true);
    try {
      await updatePassword({
        currentPassword: isOAuth ? undefined : currentPassword,
        newPassword,
      });
      toast.success(isOAuth ? 'Đã tạo mật khẩu cho tài khoản' : 'Đã cập nhật mật khẩu');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật mật khẩu');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-6 pb-20 md:pb-6 max-w-2xl mx-auto space-y-4">
      <BackButton />

      <div>
        <h1 className="text-xl font-display font-bold text-foreground">Cài đặt tài khoản</h1>
        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
      </div>

      {/* Display name */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Tên hiển thị</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Nhập tên hiển thị"
            className="flex-1 px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSaveName}
            disabled={savingName}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {savingName ? '...' : 'Lưu'}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {isOAuth ? 'Tạo mật khẩu' : 'Đổi mật khẩu'}
          </h2>
        </div>
        {isOAuth && (
          <p className="text-xs text-muted-foreground">
            Tài khoản được tạo qua Google. Bạn có thể đặt mật khẩu để đăng nhập bằng email.
          </p>
        )}

        <div className="space-y-3">
          {!isOAuth && (
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Mật khẩu hiện tại"
                className="w-full px-3 py-2.5 pr-10 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              className="w-full px-3 py-2.5 pr-10 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
            className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={handleSavePassword}
            disabled={savingPassword || !newPassword}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {savingPassword ? 'Đang xử lý...' : isOAuth ? 'Tạo mật khẩu' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </div>
    </div>
  );
}
