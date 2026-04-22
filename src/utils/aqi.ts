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

export function getAQIBgClass(level: AQILevel): string {
  return `bg-aqi-${level}`;
}
