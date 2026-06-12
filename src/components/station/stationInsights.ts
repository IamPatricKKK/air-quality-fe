/**
 * Pure UI-derivation helpers for the Station Detail dashboard.
 *
 * IMPORTANT: this module changes NO business logic. It only re-packages the
 * existing domain rules already used across the app so several presentation
 * components can share them:
 *   - Exposure model (Berkeley Earth: 22 µg/m³·h ≈ 1 cigarette; WHO 2021 ≤ 15)
 *   - Pollutant "safe" thresholds (mirrors StationDetail.tsx)
 *   - AQI classification colours (via getAQILevel / getAQIColors)
 */
import { getAQILevel, getAQIColors, getAQILabel, type AQILevel } from "@/utils/aqi";
import type { StationHistoryPoint, StationWithReading } from "@/types";

/* ── Exposure constants (unchanged from PersonalExposure.tsx) ───────────── */
export const PM25_PER_CIGARETTE_UG = 22; // Berkeley Earth rule of thumb
export const WHO_PM25_DAILY = 15; // WHO 2021 annual guideline (µg/m³)
export const AQI_UNHEALTHY_THRESHOLD = 100; // exceedance line used app-wide

/* ── Trend ──────────────────────────────────────────────────────────────── */
export type TrendDir = "up" | "down" | "flat";

export interface Trend {
  dir: TrendDir;
  delta: number; // signed absolute change
  pct: number; // signed percentage change
}

/** Compare a current value against a baseline. `flat` when |Δ| < threshold. */
export function computeTrend(current: number, baseline: number, threshold = 1): Trend {
  const delta = current - baseline;
  const pct = baseline ? (delta / baseline) * 100 : 0;
  const dir: TrendDir = Math.abs(delta) < threshold ? "flat" : delta > 0 ? "up" : "down";
  return { dir, delta, pct };
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Reference "now" = the most recent reading's timestamp (robust to stale data). */
function refTime(points: StationHistoryPoint[]): number {
  let max = 0;
  for (const p of points) {
    const t = new Date(p.recorded_at).getTime();
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max || Date.now();
}

/** Points whose age (relative to the latest reading) falls inside [from, to) hours. */
function withinHours(points: StationHistoryPoint[], from: number, to: number, now: number) {
  return points.filter((p) => {
    const t = new Date(p.recorded_at).getTime();
    const ageH = (now - t) / 3_600_000;
    return ageH >= from && ageH < to;
  });
}

/* ── Hero trends: vs yesterday & vs 7-day average ──────────────────────── */
export interface HeroTrends {
  vsYesterday: Trend | null;
  vs7day: Trend | null;
}

export function computeHeroTrends(currentAqi: number, history: StationHistoryPoint[] | undefined): HeroTrends {
  const points = history ?? [];
  const now = refTime(points);
  const today = withinHours(points, 0, 24, now).map((p) => p.aqi).filter(isNum);
  const yesterday = withinHours(points, 24, 48, now).map((p) => p.aqi).filter(isNum);
  const week = withinHours(points, 0, 168, now).map((p) => p.aqi).filter(isNum);

  const todayAvg = mean(today);
  const yesterdayAvg = mean(yesterday);
  const weekAvg = mean(week);

  return {
    vsYesterday: todayAvg !== null && yesterdayAvg !== null ? computeTrend(todayAvg, yesterdayAvg) : null,
    vs7day: weekAvg !== null ? computeTrend(currentAqi, weekAvg) : null,
  };
}

/** Trend of a single pollutant field over the last 24h vs the prior 24h. */
export function computeMetricTrend(
  history: StationHistoryPoint[] | undefined,
  field: "aqi" | "pm25" | "pm10",
  threshold = 1,
): Trend | null {
  const points = history ?? [];
  const now = refTime(points);
  const recent = withinHours(points, 0, 24, now)
    .map((p) => p[field])
    .filter(isNum);
  const prior = withinHours(points, 24, 48, now)
    .map((p) => p[field])
    .filter(isNum);
  const recentAvg = mean(recent);
  const priorAvg = mean(prior);
  if (recentAvg === null || priorAvg === null) return null;
  return computeTrend(recentAvg, priorAvg, threshold);
}

/* ── Personal exposure (identical formula to PersonalExposure.tsx) ─────── */
export interface ExposureStats {
  avgPm25: number;
  maxPm25: number;
  cigaretteEquivalent: number;
  hoursAboveWho: number;
  totalHours: number;
}

export function computeExposure(history: StationHistoryPoint[] | undefined): ExposureStats | null {
  const all = history ?? [];
  const now = refTime(all);
  const points = all.filter((p) => {
    const ageH = (now - new Date(p.recorded_at).getTime()) / 3_600_000;
    return ageH < 24;
  });
  const pm25Values = points.map((p) => p.pm25).filter(isNum);
  if (pm25Values.length === 0) return null;

  const sum = pm25Values.reduce((a, b) => a + b, 0);
  const avg = sum / pm25Values.length;
  const max = Math.max(...pm25Values);
  const cigaretteEquivalent = sum / PM25_PER_CIGARETTE_UG / 24;
  const hoursAboveWho = pm25Values.filter((v) => v > WHO_PM25_DAILY).length;

  return {
    avgPm25: Math.round(avg * 10) / 10,
    maxPm25: Math.round(max * 10) / 10,
    cigaretteEquivalent: Math.round(cigaretteEquivalent * 10) / 10,
    hoursAboveWho,
    totalHours: pm25Values.length,
  };
}

/* ── Pollutant analysis (thresholds mirror StationDetail.tsx) ──────────── */
export type PollutantKey = "pm25" | "pm10" | "o3" | "no2" | "so2" | "co";
export type Severity = "good" | "moderate" | "high" | "severe";

export interface PollutantMeta {
  key: PollutantKey;
  label: string;
  name: string; // full Vietnamese name
  unit: string;
  safe: number; // WHO/EPA reference threshold
}

export const POLLUTANTS: PollutantMeta[] = [
  { key: "pm25", label: "PM2.5", name: "Bụi mịn PM2.5", unit: "µg/m³", safe: 35 },
  { key: "pm10", label: "PM10", name: "Bụi PM10", unit: "µg/m³", safe: 50 },
  { key: "o3", label: "O₃", name: "Ozone tầng mặt", unit: "ppb", safe: 70 },
  { key: "no2", label: "NO₂", name: "Nitơ điôxít", unit: "ppb", safe: 53 },
  { key: "so2", label: "SO₂", name: "Lưu huỳnh điôxít", unit: "ppb", safe: 35 },
  { key: "co", label: "CO", name: "Carbon monoxit", unit: "ppm", safe: 4.4 },
];

/** Map a pollutant severity to a brand-aligned AQI colour token. */
const SEVERITY_LEVEL: Record<Severity, AQILevel> = {
  good: "good",
  moderate: "moderate",
  high: "unhealthy-sensitive",
  severe: "unhealthy",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  good: "An toàn",
  moderate: "Trung bình",
  high: "Cao",
  severe: "Nguy hiểm",
};

export interface PollutantReading {
  meta: PollutantMeta;
  value: number;
  ratio: number; // value / safe (1 = at threshold)
  pct: number; // 0–100 fill for a progress bar (capped at threshold×2)
  severity: Severity;
  color: string; // brand AQI colour (hsl)
  tint: string;
}

function severityFromRatio(ratio: number): Severity {
  if (ratio < 0.5) return "good";
  if (ratio < 1) return "moderate";
  if (ratio < 1.5) return "high";
  return "severe";
}

/** Analyse all pollutants for a station, sorted most→least dangerous. */
export function analyzePollutants(station: StationWithReading): PollutantReading[] {
  return POLLUTANTS.map((meta) => {
    const value = Number(station[meta.key] ?? 0);
    const ratio = meta.safe > 0 ? value / meta.safe : 0;
    const severity = severityFromRatio(ratio);
    const { solid, tint } = getAQIColors(SEVERITY_LEVEL[severity]);
    return {
      meta,
      value,
      ratio,
      pct: Math.min(ratio / 2, 1) * 100,
      severity,
      color: solid,
      tint,
    };
  }).sort((a, b) => b.ratio - a.ratio);
}

/* ── Province ranking (client-side over already-fetched stations) ──────── */
export interface ProvinceRank {
  rank: number; // 1 = most polluted in the province
  total: number;
  province: string;
}

export function computeProvinceRank(
  station: StationWithReading,
  allStations: StationWithReading[] | undefined,
): ProvinceRank | null {
  if (!allStations || allStations.length === 0) return null;
  const peers = allStations.filter((s) => s.region === station.region);
  if (peers.length <= 1) return null;
  const sorted = [...peers].sort((a, b) => b.aqi - a.aqi);
  const rank = sorted.findIndex((s) => s.id === station.id) + 1;
  if (rank === 0) return null;
  return { rank, total: peers.length, province: station.region };
}

/* ── AQI category bands (for chart background zones) ───────────────────── */
export interface AqiBand {
  y1: number;
  y2: number;
  level: AQILevel;
  color: string;
}

export const AQI_BANDS: AqiBand[] = (
  [
    [0, 50, "good"],
    [50, 100, "moderate"],
    [100, 150, "unhealthy-sensitive"],
    [150, 200, "unhealthy"],
    [200, 300, "very-unhealthy"],
    [300, 500, "hazardous"],
  ] as [number, number, AQILevel][]
).map(([y1, y2, level]) => ({ y1, y2, level, color: getAQIColors(level).solid }));

/* ── Shared AQI colour helpers (brand tokens, never EPA hex) ───────────── */
export function aqiColors(aqi: number) {
  return getAQIColors(getAQILevel(aqi));
}
export function aqiLabel(aqi: number) {
  return getAQILabel(getAQILevel(aqi));
}
export function aqiLevel(aqi: number) {
  return getAQILevel(aqi);
}
