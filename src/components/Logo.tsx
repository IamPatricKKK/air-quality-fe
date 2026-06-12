import { Link, useLocation } from 'react-router-dom';
import { scrollToTop } from '@/lib/smoothScroll';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** Giữ lại để tương thích các nơi đang gọi — chữ đã nằm sẵn trong ảnh logo. */
  showText?: boolean;
  vertical?: boolean;
}

export function Logo({ size = 'md' }: LogoProps) {
  /* Logo là ảnh ngang (đã có sẵn chữ "AIR QUALITY") → set chiều cao, rộng auto
     để giữ đúng tỉ lệ trên mọi chỗ dùng. */
  const logoHeight = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-24',
  }[size];

  const location = useLocation();
  // Logo luôn về trang landing `/`. Khi đã ở `/` thì chỉ cuộn lên đầu trang.
  const isLanding = location.pathname === '/';

  const handleClick = (e: React.MouseEvent) => {
    if (isLanding) {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      aria-label="Air Quality VN"
      className="inline-flex items-center no-underline group"
    >
      <img
        src="/logo.png"
        alt="Air Quality VN"
        className={`${logoHeight} w-auto rounded-lg object-contain shadow-sm transition-transform duration-200 group-hover:scale-[1.03]`}
      />
    </Link>
  );
}
