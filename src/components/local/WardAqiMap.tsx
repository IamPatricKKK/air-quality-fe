import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import type { Feature, FeatureCollection } from 'geojson';
import { getAqiCategory, AQI_CATEGORIES } from '@/lib/aqi';

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

/** Chuẩn hoá tên tỉnh để khớp giữa geojson (shapeName) và provinceName của ward. */
export function normalizeProvince(s: string): string {
  return s.replace(/^(Tỉnh|Thành phố|TP\.?)\s+/i, '').trim().toLowerCase();
}

export interface ProvinceMapDatum {
  name: string;
  avgAqi: number | null;
  wardCount: number;
}

interface WardAqiMapProps {
  data: Map<string, ProvinceMapDatum>;
  selectedKey: string | null;
  onSelect: (key: string, name: string) => void;
}

/**
 * Giữ kích thước Leaflet đồng bộ với container (tránh map trắng do
 * container được set chiều cao sau khi map khởi tạo) + khung toàn VN khi
 * geojson tải xong.
 */
function MapController({ geo }: { geo: FeatureCollection | null }) {
  const map = useMap();

  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t0 = setTimeout(fix, 0);
    const t1 = setTimeout(fix, 250);
    const ro = new ResizeObserver(fix);
    ro.observe(map.getContainer());
    window.addEventListener('resize', fix);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      ro.disconnect();
      window.removeEventListener('resize', fix);
    };
  }, [map]);

  useEffect(() => {
    if (!geo) return;
    map.invalidateSize();
    try {
      const b = L.geoJSON(geo as FeatureCollection).getBounds();
      if (b.isValid()) map.fitBounds(b, { padding: [16, 16] });
    } catch {
      /* noop */
    }
  }, [geo, map]);

  return null;
}

/**
 * Choropleth tỉnh/thành Việt Nam tô màu theo AQI trung bình (suy từ ward IDW).
 * Hover hiện tooltip, click để focus + chọn tỉnh. Chỉ nạp ranh giới tỉnh
 * (vn-provinces.geojson, ~34 tỉnh sau sáp nhập 2025) — không nạp ward 7MB.
 */
export function WardAqiMap({ data, selectedKey, onSelect }: WardAqiMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const geoRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    fetch('/vn-provinces.geojson')
      .then((r) => r.json())
      .then((d: FeatureCollection) => setGeo(d))
      .catch(console.error);
  }, []);

  const styleFn = (feature?: Feature) => {
    const props = (feature?.properties ?? {}) as Record<string, string>;
    const key = normalizeProvince(props.shapeName ?? props.name ?? '');
    const aqi = data.get(key)?.avgAqi ?? null;
    const cat = getAqiCategory(aqi);
    const isSel = selectedKey === key;
    return {
      fillColor: aqi != null ? cat.color : isDark ? '#475569' : '#cbd5e1',
      fillOpacity: aqi != null ? (isSel ? 0.9 : 0.62) : 0.18,
      color: isSel ? (isDark ? '#ffffff' : '#0f172a') : isDark ? 'rgba(255,255,255,0.22)' : 'rgba(15,23,42,0.18)',
      weight: isSel ? 2.5 : 0.8,
      fillRule: 'nonzero' as const,
      lineJoin: 'round' as const,
    };
  };

  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    const props = (feature.properties ?? {}) as Record<string, string>;
    const name = props.shapeName ?? 'Không rõ';
    const key = normalizeProvince(name);
    const d = data.get(key);
    const aqi = d?.avgAqi ?? null;
    const cat = getAqiCategory(aqi);

    layer.bindTooltip(
      `<div style="font-family:'Be Vietnam Pro',system-ui,sans-serif;min-width:150px">
         <div style="font-weight:700;margin-bottom:4px">${name}</div>
         <div style="display:flex;align-items:center;gap:6px">
           <span style="width:10px;height:10px;border-radius:50%;background:${cat.color};display:inline-block"></span>
           <b style="font-variant-numeric:tabular-nums">${aqi ?? '—'}</b>
           <span style="opacity:.72">${cat.label}</span>
         </div>
         <div style="opacity:.7;font-size:11px;margin-top:2px">${d?.wardCount ?? 0} xã/phường</div>
       </div>`,
      { sticky: true, direction: 'top', opacity: 1 },
    );

    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => (e.target as L.Path).setStyle({ weight: 2, fillOpacity: 0.82 }),
      mouseout: (e: L.LeafletMouseEvent) => geoRef.current?.resetStyle(e.target as L.Path),
      click: (e: L.LeafletMouseEvent) => {
        onSelect(key, name);
        const m = (e.target as L.Path & { _map?: L.Map })._map;
        const target = e.target as L.Polygon;
        if (m && target.getBounds) m.fitBounds(target.getBounds(), { padding: [24, 24], maxZoom: 8 });
      },
    });
  };

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={[16, 106]}
        zoom={5}
        className="h-full w-full"
        preferCanvas
        zoomControl
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer key={isDark ? 'dark' : 'light'} url={isDark ? TILE_DARK : TILE_LIGHT} />
        <MapController geo={geo} />
        {geo && (
          <GeoJSON
            ref={geoRef}
            key={`prov-${selectedKey ?? 'none'}-${data.size}`}
            data={geo}
            style={styleFn}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* AQI legend */}
      <div className="absolute left-3 bottom-3 z-[1000] rounded-xl bg-card/90 backdrop-blur-sm border border-border/60 px-3 py-2 shadow-md">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Thang AQI</div>
        <div className="grid grid-cols-1 gap-1">
          {AQI_CATEGORIES.map((c) => (
            <div key={c.code} className="flex items-center gap-2 text-[10px] leading-none">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: c.color }} />
              <span className="tabular-nums text-muted-foreground w-12">
                {c.min}
                {c.max ? `–${c.max}` : '+'}
              </span>
              <span className="text-foreground/75">{c.labelShort}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
