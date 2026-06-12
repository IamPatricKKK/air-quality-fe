import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { registerLenis } from '@/lib/smoothScroll';

/**
 * Bật cuộn mượt (momentum) toàn trang bằng Lenis.
 * - Tôn trọng `prefers-reduced-motion` → không bật.
 * - Trên cảm ứng dùng cuộn native (Lenis mặc định không smooth touch).
 * - Bỏ qua bản đồ Leaflet, popup/menu/listbox và phần tử gắn `data-lenis-prevent`
 *   để cuộn bên trong các vùng đó vẫn hoạt động bình thường.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      prevent: (node) =>
        Boolean(
          node.classList?.contains('leaflet-container') ||
            node.hasAttribute?.('data-lenis-prevent') ||
            ['dialog', 'menu', 'listbox'].includes(node.getAttribute?.('role') ?? ''),
        ),
    });

    registerLenis(lenis);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
