import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';

/**
 * Trả về hàm đổi sáng/tối — quét chéo mượt bằng View Transitions nếu hỗ trợ.
 * Dùng chung cho nút ThemeToggle (header desktop / trang Tài khoản) và gesture
 * ẩn khi chạm chỉ báo "LIVE" trên header mobile.
 */
export function useThemeToggle() {
  const { theme, setTheme } = useTheme();

  return () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => setTheme(next));
      document.documentElement.classList.toggle('dark', next === 'dark');
    });
  };
}
