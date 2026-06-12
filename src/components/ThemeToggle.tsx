import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';

    // Quét chéo mượt từ góc trên-trái xuống dưới-phải bằng View Transitions
    // (CSS ::view-transition-new(root) trong index.css). Trình duyệt chưa hỗ
    // trợ hoặc người dùng tắt animation → đổi theme ngay như cũ.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => setTheme(next));
      // next-themes áp class trong effect (có thể sau snapshot) — chốt class
      // ngay tại đây để khung hình mới được chụp đúng theme đích.
      document.documentElement.classList.toggle('dark', next === 'dark');
    });
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Chuyển đổi giao diện"
    >
      <Sun className="w-[18px] h-[18px] hidden dark:block" />
      <Moon className="w-[18px] h-[18px] block dark:hidden" />
    </button>
  );
}
