import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Chuyển đổi giao diện"
    >
      <Sun className="w-[18px] h-[18px] hidden dark:block" />
      <Moon className="w-[18px] h-[18px] block dark:hidden" />
    </button>
  );
}
