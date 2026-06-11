#!/usr/bin/env bash
# Trích xuất dữ liệu thật từ bản dump (đã restore vào Postgres tạm) ra các file
# JSON tĩnh trong public/mock/ để FE chạy offline, KHÔNG cần backend.
#
# Cách dùng:
#   PGHOST=localhost PGPORT=55432 PGUSER=pg PGDATABASE=sky_pulse \
#     bash scripts/gen-mock-data.sh
#
# Sau khi chạy xong có thể tắt/xoá Postgres tạm — FE chỉ đọc file JSON.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/mock"
mkdir -p "$OUT"

export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-55432}"
export PGUSER="${PGUSER:-pg}"
export PGDATABASE="${PGDATABASE:-sky_pulse}"

# Biểu thức phân loại AQI (snake_case khớp analytics.daily_summaries)
CAT='CASE WHEN %s IS NULL THEN NULL
  WHEN %s<=50 THEN '"'"'good'"'"'
  WHEN %s<=100 THEN '"'"'moderate'"'"'
  WHEN %s<=150 THEN '"'"'unhealthy_sensitive'"'"'
  WHEN %s<=200 THEN '"'"'unhealthy'"'"'
  WHEN %s<=300 THEN '"'"'very_unhealthy'"'"'
  ELSE '"'"'hazardous'"'"' END'
cat_expr() { printf "$CAT" "$1" "$1" "$1" "$1" "$1" "$1"; }

# Chạy 1 query trả về đúng 1 giá trị JSON, ghi ra file.
q() { # q <outfile> <sql>
  local f="$1"; shift
  psql -tA -c "$1" > "$OUT/$f"
  printf '  %-26s %8s bytes\n' "$f" "$(wc -c < "$OUT/$f" | tr -d ' ')"
}

echo "→ Sinh JSON mock vào $OUT"

# 1) stations.json — StationWithReading[] (latest air obs + weather, region từ province)
q stations.json "
WITH latest_air AS (
  SELECT DISTINCT ON (station_id) station_id, observed_at, aqi, pm25, pm10, o3, no2, so2, co,
         temperature_c, humidity_pct, wind_speed_mps
  FROM core.air_quality_observations ORDER BY station_id, observed_at DESC),
latest_wx AS (
  SELECT DISTINCT ON (station_id) station_id, temperature_c, humidity_pct, wind_speed_mps
  FROM core.weather_observations ORDER BY station_id, observed_at DESC)
SELECT COALESCE(json_agg(r),'[]'::json) FROM (
  SELECT json_build_object(
    'id', s.id, 'name', s.name,
    'region', COALESCE(p.name,''), 'city', COALESCE(p.name,''),
    'lat', s.lat, 'lng', s.lng,
    'waqi_station_id', s.metadata->>'waqi_uid',
    'is_active', s.is_active,
    'aqi', COALESCE(la.aqi,0), 'pm25', COALESCE(la.pm25,0), 'pm10', COALESCE(la.pm10,0),
    'o3', COALESCE(la.o3,0), 'no2', COALESCE(la.no2,0), 'so2', COALESCE(la.so2,0), 'co', COALESCE(la.co,0),
    'temperature', COALESCE(la.temperature_c, lw.temperature_c, 0),
    'humidity', COALESCE(la.humidity_pct, lw.humidity_pct, 0),
    'wind_speed', COALESCE(la.wind_speed_mps, lw.wind_speed_mps, 0),
    'recorded_at', la.observed_at) r
  FROM catalog.stations s
  LEFT JOIN catalog.areas p ON p.id = s.area_id
  LEFT JOIN latest_air la ON la.station_id = s.id
  LEFT JOIN latest_wx lw ON lw.station_id = s.id
  WHERE la.station_id IS NOT NULL
  ORDER BY la.aqi DESC NULLS LAST) q;"

# 2) history.json — { [stationId]: StationHistoryPoint[] } (toàn bộ lịch sử ~9 ngày)
q history.json "
SELECT COALESCE(json_object_agg(station_id, pts),'{}'::json) FROM (
  SELECT station_id, json_agg(json_build_object(
    'recorded_at', observed_at, 'aqi', aqi, 'pm25', pm25, 'pm10', pm10, 'o3', o3, 'no2', no2
  ) ORDER BY observed_at) pts
  FROM core.air_quality_observations GROUP BY station_id) t;"

# 3) wards.json — WardAqi[] (1 dòng latest / xã, kèm province)
q wards.json "
SELECT COALESCE(json_agg(r),'[]'::json) FROM (
  SELECT json_build_object(
    'id', w.ward_id, 'code', a.code, 'name', a.name,
    'provinceCode', p.code, 'provinceName', p.name,
    'aqi', w.aqi, 'pm25', w.pm25, 'pm10', w.pm10,
    'confidence', w.confidence_score, 'stationCount', w.station_count,
    'nearestKm', w.nearest_km, 'analyzedAt', w.observed_at, 'source', w.source_code) r
  FROM analytics.ward_aqi_observations w
  JOIN catalog.areas a ON a.id = w.ward_id
  LEFT JOIN catalog.areas p ON p.id = a.parent_id
  ORDER BY w.aqi DESC NULLS LAST) q;"

# 4) grid.json — Grid trống (feature OFF trong dump)
q grid.json "SELECT json_build_object('count',0,'data','[]'::json);"

# 5) forecast.json — { [stationId]: ForecastLatest } (run mới nhất + points)
q forecast.json "
WITH lr AS (
  SELECT DISTINCT ON (fr.station_id) fr.*, s.name station_name
  FROM forecast.forecast_runs fr JOIN catalog.stations s ON s.id=fr.station_id
  WHERE fr.status='success'
  ORDER BY fr.station_id, fr.started_at DESC)
SELECT COALESCE(json_object_agg(station_id, obj),'{}'::json) FROM (
  SELECT lr.station_id, json_build_object(
    'run', json_build_object(
      'id',lr.id,'stationId',lr.station_id,'stationName',lr.station_name,
      'modelType',lr.model_type,'targetMetric',lr.target_metric,'horizonHours',lr.horizon_hours,
      'mae',lr.mae,'rmse',lr.rmse,'mape',lr.mape,'trainingRows',lr.training_rows,
      'status',lr.status,'startedAt',lr.started_at,'finishedAt',lr.finished_at),
    'points', COALESCE((
      SELECT json_agg(json_build_object(
        'predictedAt',fp.predicted_at,'predictedValue',fp.predicted_value,
        'lowerBound',fp.lower_bound,'upperBound',fp.upper_bound) ORDER BY fp.predicted_at)
      FROM forecast.forecast_points fp WHERE fp.forecast_run_id=lr.id),'[]'::json)) obj
  FROM lr) t;"

# 6) daily-summaries.json — { [stationId]: DailySummary[] }
q daily-summaries.json "
SELECT COALESCE(json_object_agg(station_id, arr),'{}'::json) FROM (
  SELECT ds.station_id, json_agg(json_build_object(
    'id',ds.id,'stationId',ds.station_id,'stationName',s.name,'summaryDate',ds.summary_date,
    'samples',ds.samples,'aqiAvg',ds.aqi_avg,'aqiMin',ds.aqi_min,'aqiMax',ds.aqi_max,
    'aqiStddev',ds.aqi_stddev,'pm25Avg',ds.pm25_avg,'pm10Avg',ds.pm10_avg,'category',ds.category
  ) ORDER BY ds.summary_date) arr
  FROM analytics.daily_summaries ds JOIN catalog.stations s ON s.id=ds.station_id
  GROUP BY ds.station_id) t;"

# 7) anomalies.json — { [stationId]: Anomaly[] }
q anomalies.json "
SELECT COALESCE(json_object_agg(station_id, arr),'{}'::json) FROM (
  SELECT an.station_id, json_agg(json_build_object(
    'id',an.id,'stationId',an.station_id,'stationName',s.name,'metric',an.metric,
    'detectedAt',an.detected_at,'value',an.value,'zScore',an.z_score,'iqrFactor',an.iqr_factor,
    'method',an.method,'severity',an.severity,'description',an.description
  ) ORDER BY an.detected_at DESC) arr
  FROM analytics.anomalies an JOIN catalog.stations s ON s.id=an.station_id
  GROUP BY an.station_id) t;"

# 8) analytics.json — { [stationId]: StationAnalytics } (current + summary_24h + forecast slope)
q analytics.json "
WITH la AS (
  SELECT DISTINCT ON (station_id) station_id, observed_at, aqi, pm25, pm10, o3, no2, so2, co,
         temperature_c, humidity_pct, wind_speed_mps
  FROM core.air_quality_observations ORDER BY station_id, observed_at DESC),
maxt AS (SELECT station_id, max(observed_at) mo FROM core.air_quality_observations GROUP BY station_id),
win AS (
  SELECT o.station_id, count(*) samples,
    avg(o.aqi)::numeric(10,1) aqi_avg, min(o.aqi) aqi_min, max(o.aqi) aqi_max,
    avg(o.pm25)::numeric(10,1) pm25_avg, avg(o.pm10)::numeric(10,1) pm10_avg,
    regr_slope(o.aqi, extract(epoch from o.observed_at)/3600.0)::numeric(10,3) slope
  FROM core.air_quality_observations o JOIN maxt m ON m.station_id=o.station_id
  WHERE o.observed_at >= m.mo - interval '24 hours'
  GROUP BY o.station_id)
SELECT COALESCE(json_object_agg(t.id, t.obj),'{}'::json) FROM (
  SELECT s.id, json_build_object(
    'station', json_build_object('id',s.id,'code',s.code,'name',s.name),
    'current', json_build_object(
      'aqi',la.aqi,'category',$(cat_expr la.aqi),
      'pm25',la.pm25,'pm10',la.pm10,'o3',la.o3,'no2',la.no2,'so2',la.so2,'co',la.co,
      'temperature',la.temperature_c,'humidity',la.humidity_pct,'wind_speed',la.wind_speed_mps,
      'observed_at',la.observed_at),
    'summary_24h', json_build_object(
      'samples',COALESCE(w.samples,0),'aqi_avg',w.aqi_avg,'aqi_min',w.aqi_min,'aqi_max',w.aqi_max,
      'pm25_avg',w.pm25_avg,'pm10_avg',w.pm10_avg,'category',$(cat_expr 'round(w.aqi_avg)')),
    'forecast', json_build_object(
      'slope_per_hour',w.slope,
      'aqi_next_1h',CASE WHEN w.slope IS NULL THEN NULL ELSE round(la.aqi + w.slope*1) END,
      'aqi_next_3h',CASE WHEN w.slope IS NULL THEN NULL ELSE round(la.aqi + w.slope*3) END,
      'aqi_next_6h',CASE WHEN w.slope IS NULL THEN NULL ELSE round(la.aqi + w.slope*6) END,
      'category_6h',CASE WHEN w.slope IS NULL THEN NULL ELSE $(cat_expr 'round(la.aqi + w.slope*6)') END)
  ) obj
  FROM catalog.stations s
  JOIN la ON la.station_id=s.id
  LEFT JOIN win w ON w.station_id=s.id) t;"

echo "✓ Hoàn tất. Đã ghi $(ls -1 "$OUT" | wc -l | tr -d ' ') file."
