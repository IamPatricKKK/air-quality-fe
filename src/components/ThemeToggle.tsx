import { Moon, Sun } from 'lucide-react';
import { useThemeToggle } from '@/hooks/useThemeToggle';

export function ThemeToggle() {
  const toggle = useThemeToggle();

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
