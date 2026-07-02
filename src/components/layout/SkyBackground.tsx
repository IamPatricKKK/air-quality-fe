/**
 * Ambient sky backdrop, fixed behind all page content (CSS in index.css).
 * Light mode: gradient sky + two seamlessly-looping cloud strips drifting at
 * different speeds (parallax). Dark mode: moonlit night photo, slow pan.
 * A veil gradient fades everything into --background for readability.
 * Pages that should show it must not paint an opaque wrapper background.
 */
export function SkyBackground() {
  return (
    <div aria-hidden className="sky-ambient">
      <div className="sky-ambient-photo" />
      <div className="sky-marquee sky-marquee-far">
        <div />
        <div />
      </div>
      <div className="sky-marquee sky-marquee-near">
        <div />
        <div />
      </div>
      <div className="sky-marquee sky-marquee-low">
        <div />
        <div />
      </div>
      <div className="sky-ambient-veil" />
    </div>
  );
}
