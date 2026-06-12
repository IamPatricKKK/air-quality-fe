import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { scrollToTop } from '@/lib/smoothScroll';

/**
 * Cuộn về đầu trang mỗi khi đổi route (pathname đổi).
 * BrowserRouter không tự khôi phục scroll như ScrollRestoration của data router,
 * nên xử lý thủ công ở đây. Đặt bên trong <BrowserRouter>.
 */
export function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    scrollToTop(true);
  }, [pathname]);
  return null;
}

/** Nút nổi "lên đầu trang" — hiện khi đã cuộn xuống, bấm để cuộn mượt lên đầu. */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => scrollToTop()}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      className="fixed z-30 bottom-20 right-4 md:bottom-6 md:right-6 inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 border border-primary/20 hover:scale-105 active:scale-95 transition-transform"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
