import { Link } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/hooks/useAuthModal';

interface FooterLink {
  label: string;
  to?: string;
  onClick?: () => void;
}

export function Footer() {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const year = new Date().getFullYear();

  const explore: FooterLink[] = [
    { label: 'Bảng điều khiển', to: '/home' },
    { label: 'Giới thiệu', to: user ? '/intro' : '/' },
  ];

  const account: FooterLink[] = user
    ? [
        { label: 'Trang cá nhân', to: '/profile' },
        { label: 'Thông báo & cảnh báo', to: '/notifications' },
        { label: 'Cài đặt tài khoản', to: '/profile/settings' },
      ]
    : [
        { label: 'Đăng nhập', onClick: openAuthModal },
        { label: 'Đăng ký tài khoản', onClick: openAuthModal },
      ];

  const project: FooterLink[] = [
    { label: 'Về dự án', to: '/about' },
  ];

  const renderLink = (l: FooterLink) => {
    const cls =
      'inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors';
    if (l.onClick) {
      return (
        <button key={l.label} onClick={l.onClick} className={cls}>
          {l.label}
        </button>
      );
    }
    return (
      <Link key={l.label} to={l.to!} className={cls}>
        {l.label}
      </Link>
    );
  };

  return (
    <footer className="border-t border-border/60 bg-secondary/25 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-14">
        <div className="grid gap-6 md:gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand — căn giữa và thu gọn trên mobile, trải trái từ sm trở lên */}
          <div className="flex flex-col items-center text-center gap-3 sm:items-start sm:text-left sm:gap-4">
            <Logo size="md" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
              Hệ thống theo dõi chất lượng không khí thời gian thực trên toàn quốc — chỉ số AQI,
              cảnh báo ô nhiễm, dự báo và lời khuyên sức khoẻ.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground rounded-full bg-secondary/60 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              56 trạm quan trắc · cập nhật mỗi 5 phút
            </div>
            {/* Mobile-only quick links: the full link columns are hidden on
                phones (they duplicate the bottom tab bar) — keep just the
                destinations the tab bar doesn't cover. */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 sm:hidden">
              <Link to="/about" className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors">
                Về dự án
              </Link>
              <span className="text-border">·</span>
              <a
                href="mailto:letruongle325@gmail.com"
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                <Mail className="w-3 h-3" />
                Liên hệ
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="hidden sm:block">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
              Khám phá
            </h3>
            <ul className="space-y-2.5">
              {explore.map(l => (
                <li key={l.label}>{renderLink(l)}</li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="hidden sm:block">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
              Tài khoản
            </h3>
            <ul className="space-y-2.5">
              {account.map(l => (
                <li key={l.label}>{renderLink(l)}</li>
              ))}
            </ul>
          </div>

          {/* Project + contact */}
          <div className="hidden sm:block">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
              Dự án
            </h3>
            <ul className="space-y-2.5">
              {project.map(l => (
                <li key={l.label}>{renderLink(l)}</li>
              ))}
              <li>
                <a
                  href="mailto:letruongle325@gmail.com"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-5 md:mt-10 pt-4 md:pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] sm:text-xs text-muted-foreground text-center sm:text-left">
            © {year} Air Quality VN. Dữ liệu từ WAQI · OpenAQ · Berkeley Earth.
          </p>
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Việt Nam
            </span>
            <a
              href="mailto:letruongle325@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              letruongle325@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
