import { getAQILevel, getAQILabel, getAQIColors } from '@/utils/aqi';

/**
 * Visual primitives shared across the ranking dashboard.
 * Colors are derived strictly from the app's `--aqi-*` design tokens
 * (via getAQIColors), so the AQI scale stays on-brand in light & dark mode:
 *   ≤50 green · ≤100 amber · ≤150 orange · ≤200 ember · ≤300 crimson · 301+ maroon
 */

/* Medal accents for the Top-3 podium & leaderboard rows. Used only on the small
   rank chip — every other surface takes its color from the AQI level. */
export const MEDALS = [
  { emoji: '🥇', label: 'Hạng 1', grad: 'linear-gradient(135deg,#FCE28A 0%,#E0A019 100%)', ring: 'hsl(43 86% 48%)', glow: 'hsl(43 86% 48% / 0.35)' },
  { emoji: '🥈', label: 'Hạng 2', grad: 'linear-gradient(135deg,#EEF1F5 0%,#A7B0BB 100%)', ring: 'hsl(214 12% 68%)', glow: 'hsl(214 12% 60% / 0.30)' },
  { emoji: '🥉', label: 'Hạng 3', grad: 'linear-gradient(135deg,#EBBE8E 0%,#AC6526 100%)', ring: 'hsl(28 56% 50%)', glow: 'hsl(28 56% 50% / 0.30)' },
] as const;

type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';

const BADGE_SIZES: Record<BadgeSize, string> = {
  sm: 'min-w-[38px] px-1.5 py-0.5 text-xs rounded-md',
  md: 'min-w-[46px] px-2.5 py-1 text-sm rounded-lg',
  lg: 'min-w-[58px] px-3 py-1.5 text-lg rounded-xl',
  xl: 'min-w-[84px] px-4 py-2 text-3xl rounded-2xl',
};

/** Solid, white-on-color AQI chip — the strongest scannable element in a row. */
export function AqiBadge({ aqi, size = 'md' }: { aqi: number; size?: BadgeSize }) {
  const { solid } = getAQIColors(getAQILevel(aqi));
  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-white tabular-nums leading-none ${BADGE_SIZES[size]}`}
      style={{ background: solid, fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}
    >
      {aqi}
    </span>
  );
}

/** Soft, tinted category pill (Tốt / Trung bình / …) with a leading status dot. */
export function StatusBadge({ aqi, className = '' }: { aqi: number; className?: string }) {
  const level = getAQILevel(aqi);
  const { solid, tint } = getAQIColors(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${className}`}
      style={{ background: tint, color: solid }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: solid }} />
      {getAQILabel(level)}
    </span>
  );
}
