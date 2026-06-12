/**
 * Ambient animated sky backdrop: soft gradient + slowly drifting cloud puffs.
 * CSS-only (see .sky-ambient in index.css), fixed behind all page content.
 * The page wrapper must not paint an opaque background over it.
 */
export function SkyBackground() {
  return (
    <div aria-hidden className="sky-ambient">
      <div className="sky-ambient-cloud sky-ambient-cloud-1" />
      <div className="sky-ambient-cloud sky-ambient-cloud-2" />
      <div className="sky-ambient-cloud sky-ambient-cloud-3" />
    </div>
  );
}
