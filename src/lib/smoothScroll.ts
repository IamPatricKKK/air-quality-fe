import type Lenis from 'lenis';

/**
 * Giữ một tham chiếu tới instance Lenis đang chạy để các thao tác cuộn lập trình
 * (Logo, nút lên đầu trang, reset khi đổi route) đi qua Lenis — tránh xung đột
 * với cuộn mượt. Fallback về window.scrollTo khi Lenis tắt (reduced-motion).
 */
let instance: Lenis | null = null;

export function registerLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis(): Lenis | null {
  return instance;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Cuộn lên đầu trang. immediate=true để nhảy tức thì (dùng khi đổi route). */
export function scrollToTop(immediate = false) {
  if (instance) {
    instance.scrollTo(0, immediate ? { immediate: true } : { duration: 1.1, easing: easeOutCubic });
  } else {
    window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
  }
}
