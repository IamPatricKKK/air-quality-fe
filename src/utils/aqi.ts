/**
 * AQI level utilities — classification, labels, and CSS classes.
 * Based on EPA Air Quality Index breakpoints.
 */

export type AQILevel =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

export function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy-sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}

export function getAQILabel(level: AQILevel): string {
  switch (level) {
    case "good":
      return "Tốt";
    case "moderate":
      return "Trung bình";
    case "unhealthy-sensitive":
      return "Không tốt cho nhóm nhạy cảm";
    case "unhealthy":
      return "Không tốt";
    case "very-unhealthy":
      return "Rất không tốt";
    case "hazardous":
      return "Nguy hại";
  }
}

export function getAQIColorClass(level: AQILevel): string {
  return `aqi-${level}`;
}

/**
 * Inline-style colors for an AQI level, derived from the app's `--aqi-*`
 * CSS variables so pills/accents stay consistent in light & dark mode.
 * - `solid`: full-opacity color (number pills, top accents)
 * - `tint`:  soft translucent background (status pills)
 */
export function getAQIColors(level: AQILevel): { solid: string; tint: string } {
  const v = `var(--aqi-${level})`;
  return {
    solid: `hsl(${v})`,
    tint: `hsl(${v} / 0.14)`,
  };
}

export function getAQIBgClass(level: AQILevel): string {
  return `bg-aqi-${level}`;
}
