/**
 * API client cho analytics endpoints (air-quality-be).
 * BE URL khác với API URL (API = NestJS port 3002, BE = FastAPI port 8000).
 * FE cần gọi BE cho analytics/forecast data.
 */

import { USE_MOCK, mockBeRequest } from "@/api/mockDb";

const BE_URL = import.meta.env.VITE_AIR_QUALITY_BE_URL;
const SESSION_KEY = "air-quality-fe:user-session";

function getAuth() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    const s = JSON.parse(raw) as { access_token?: string };
    return s.access_token ? `Bearer ${s.access_token}` : undefined;
  } catch {
    return undefined;
  }
}

async function beRequest<T>(path: string): Promise<T> {
  if (USE_MOCK) return mockBeRequest<T>(path);
  if (!BE_URL) throw new Error("BE URL not configured (VITE_AIR_QUALITY_BE_URL)");
  const auth = getAuth();
  const res = await fetch(`${BE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
  });
  if (!res.ok) throw new Error(`BE request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// ---------- Types ----------

export interface ForecastPoint {
  predictedAt: string;
  predictedValue: number;
  lowerBound: number | null;
  upperBound: number | null;
}

export interface ForecastRun {
  id: string;
  stationId: string;
  stationName: string;
  modelType: string;
  targetMetric: string;
  horizonHours: number;
  mae: number | null;
  rmse: number | null;
  mape: number | null;
  trainingRows: number;
  status: string;
  startedAt: string;
  finishedAt: string | null;
}

export interface ForecastLatest {
  run: ForecastRun;
  points: ForecastPoint[];
}

export interface DailySummary {
  id: string;
  stationId: string;
  stationName: string;
  summaryDate: string;
  samples: number;
  aqiAvg: number | null;
  aqiMin: number | null;
  aqiMax: number | null;
  aqiStddev: number | null;
  pm25Avg: number | null;
  pm10Avg: number | null;
  category: string | null;
}

export interface Anomaly {
  id: string;
  stationId: string;
  stationName: string;
  metric: string;
  detectedAt: string;
  value: number;
  zScore: number | null;
  iqrFactor: number | null;
  method: string;
  severity: string;
  description: string;
}

// ---------- API calls ----------

export function getLatestForecast(stationId: string, metric = "aqi") {
  return beRequest<ForecastLatest>(
    `/analytics/forecast/latest?stationId=${stationId}&metric=${metric}`
  );
}

export function getDailySummaries(stationId?: string, days = 30) {
  const params = new URLSearchParams({ days: String(days) });
  if (stationId) params.set("stationId", stationId);
  return beRequest<DailySummary[]>(`/analytics/daily-summaries?${params}`);
}

export function getAnomalies(stationId?: string, days = 7) {
  const params = new URLSearchParams({ days: String(days) });
  if (stationId) params.set("stationId", stationId);
  return beRequest<Anomaly[]>(`/analytics/anomalies?${params}`);
}

// ---------- Grid AQI (phủ toàn VN từ Open-Meteo) ----------

export interface GridPoint {
  id: string;
  lat: number;
  lng: number;
  province_code: string | null;
  province_name: string | null;
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  observed_at: string | null;
  source_code: string;
  confidence_score: number | null;
}

export interface GridLatestResponse {
  count: number;
  data: GridPoint[];
}

export function getGridLatest(opts: {
  bounds?: string;
  province?: string;
  maxAgeHours?: number;
} = {}) {
  const params = new URLSearchParams();
  if (opts.bounds) params.set("bounds", opts.bounds);
  if (opts.province) params.set("province", opts.province);
  if (opts.maxAgeHours) params.set("max_age_hours", String(opts.maxAgeHours));
  const qs = params.toString();
  return beRequest<GridLatestResponse>(
    qs ? `/analytics/grid/latest?${qs}` : "/analytics/grid/latest"
  );
}

export interface GridStats {
  total_grid_points: number;
  fresh_within_6h: number;
  by_source: Array<{
    source_code: string;
    count: number;
    first_at: string | null;
    last_at: string | null;
  }>;
}

export function getGridStats() {
  return beRequest<GridStats>("/analytics/grid/stats");
}
