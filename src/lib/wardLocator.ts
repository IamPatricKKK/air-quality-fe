import type { Feature, FeatureCollection, Position } from 'geojson';
import type { WardAqi } from '@/api/wards';

/**
 * Định vị xã/phường trên bản đồ từ public/vn-wards.geojson (ranh giới OSM,
 * cùng nguồn dữ liệu với BE). File ~7MB nên chỉ tải khi người dùng bấm lần
 * đầu, sau đó cache trong module (trình duyệt cũng cache chung với lớp
 * "Khu vực" của AQIMap vì cùng URL).
 */
let cache: FeatureCollection | null = null;
let pending: Promise<FeatureCollection> | null = null;

async function loadWards(): Promise<FeatureCollection> {
  if (cache) return cache;
  pending ??= fetch('/vn-wards.geojson')
    .then((r) => r.json())
    .then((d: FeatureCollection) => (cache = d));
  return pending;
}

const normalizeProvince = (s: string | null | undefined) =>
  (s ?? '').replace(/^(Tỉnh |Thành phố |TP\.?\s*)/i, '').trim().toLowerCase();

/** Tâm bbox của geometry (đủ chính xác để flyTo cấp xã). */
function centerOf(feature: Feature): { lat: number; lng: number } | null {
  const geom = feature.geometry;
  if (!geom || !('coordinates' in geom)) return null;
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  const walk = (coords: unknown): void => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number') {
      const [lng, lat] = coords as Position;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      return;
    }
    for (const c of coords) walk(c);
  };
  walk(geom.coordinates);
  if (minLat > maxLat) return null;
  return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
}

/** Tìm toạ độ tâm của xã/phường; null nếu không khớp được ranh giới nào. */
export async function locateWard(ward: WardAqi): Promise<{ lat: number; lng: number } | null> {
  const fc = await loadWards();
  const features = fc.features as Feature[];

  // 1) BE join ranh giới bằng osm_id — thử khớp code trước
  let f = ward.code
    ? features.find((ft) => String(ft.properties?.osm_id) === String(ward.code))
    : undefined;

  // 2) Khớp tên xã + tỉnh (cùng nguồn OSM nên chuỗi thường trùng tuyệt đối)
  if (!f) {
    const wn = ward.name.trim().toLowerCase();
    const pn = normalizeProvince(ward.provinceName);
    f = features.find(
      (ft) =>
        String(ft.properties?.name ?? '').trim().toLowerCase() === wn &&
        normalizeProvince(String(ft.properties?.province_name ?? '')) === pn,
    );

    // 3) Tên trùng duy nhất toàn quốc thì vẫn nhận
    if (!f) {
      const byName = features.filter(
        (ft) => String(ft.properties?.name ?? '').trim().toLowerCase() === wn,
      );
      if (byName.length === 1) f = byName[0];
    }
  }

  return f ? centerOf(f) : null;
}
