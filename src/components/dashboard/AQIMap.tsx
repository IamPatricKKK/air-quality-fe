import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Station, getAQILevel, getAQILabel } from '@/data/mockData';
import { AQIInterpolationLayer } from './AQIInterpolationLayer';
import { getAqiColor, getAqiLabel, getAqiCategory } from '@/lib/aqi';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Layers, Radio, Flame } from 'lucide-react';
import type { Feature, FeatureCollection } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import { createAqiPinIcon } from './AQIPin';
import { AQILegend } from './AQILegend';



const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
// Zoom đủ sâu thì chuyển từ ranh giới tỉnh sang xã/phường (mô hình 2 cấp).
const WARD_ZOOM = 9;
const REGION_FILL_OPACITY = 0.1;
const REGION_EMPTY_OPACITY = 0.04;

function getMarkerColor(aqi: number): string {
  return getAqiColor(aqi);
}

function getAQIColorForRegion(aqi: number): string {
  return getAqiColor(aqi);
}

function FlyToStation({ station, stations, forceFly }: { station: Station | null; stations: Station[]; forceFly?: boolean }) {
  const map = useMap();
  const hasInitializedView = useRef(false);
  const lastStationId = useRef<string | null>(null);

  useEffect(() => {
    if (!stations.length) return;

    if (!hasInitializedView.current) {
      hasInitializedView.current = true;
      lastStationId.current = station?.id ?? null;

      if (stations.length === 1) {
        map.setView([stations[0].lat, stations[0].lng], 8, { animate: false });
        return;
      }

      map.fitBounds(
        L.latLngBounds(stations.map(({ lat, lng }) => [lat, lng] as [number, number])),
        {
          padding: [32, 32],
          maxZoom: 6,
          animate: false,
        }
      );
      return;
    }

    if (!station) return;

    if (lastStationId.current === station.id && !forceFly) {
      return;
    }

    lastStationId.current = station.id;
    map.flyTo([station.lat, station.lng], Math.max(map.getZoom(), 10), { duration: 1.2 });

    // Auto-open popup after fly animation completes
    if (forceFly) {
      const openPopup = () => {
        map.eachLayer((layer: any) => {
          if (layer.getLatLng) {
            const ll = layer.getLatLng();
            if (Math.abs(ll.lat - station.lat) < 0.001 && Math.abs(ll.lng - station.lng) < 0.001) {
              layer.openPopup();
            }
          }
        });
        map.off('moveend', openPopup);
      };
      map.on('moveend', openPopup);
    }
  }, [map, station, stations, forceFly]);
  return null;
}

type MapViewMode = 'stations' | 'regions' | 'heatmap';


/** Force map refresh when viewMode changes so layers render immediately */
function ViewModeRefresh({ viewMode }: { viewMode: string }) {
  const map = useMap();
  useEffect(() => {
    // Small delay to let React unmount/mount layers, then invalidate
    const timer = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(timer);
  }, [viewMode, map]);
  return null;
}

interface ZoomWatcherProps {
  onZoomChange: (zoom: number) => void;
}

function ZoomWatcher({ onZoomChange }: ZoomWatcherProps) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        map.setZoom(map.getZoom() + delta);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [map]);

  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    },
  });
  return null;
}

interface AQIMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  forceFly?: boolean;
}

export function AQIMap({ stations, selectedStation, onSelectStation, forceFly }: AQIMapProps) {
  const { resolvedTheme } = useTheme();
  const tileUrl = resolvedTheme === 'dark' ? TILE_DARK : TILE_LIGHT;
  const [viewMode, setViewMode] = useState<MapViewMode>('stations');
  const [provincesGeo, setProvincesGeo] = useState<FeatureCollection | null>(null);
  const [wardsGeo, setWardsGeo] = useState<FeatureCollection | null>(null);
  const [currentZoom, setCurrentZoom] = useState(6);
  const mappableStations = useMemo(
    () => stations.filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lng)),
    [stations]
  );

  // Load GeoJSON data — mô hình 2 cấp sau cải cách 2025: tỉnh → xã/phường.
  // Dùng hình học OSM nguyên vẹn (không normalize) để không méo/hở ranh giới.
  useEffect(() => {
    if (viewMode === 'regions') {
      if (!provincesGeo) {
        fetch('/vn-provinces.geojson')
          .then(r => r.json())
          .then((data: FeatureCollection) => setProvincesGeo(data))
          .catch(console.error);
      }
      if (!wardsGeo && currentZoom >= WARD_ZOOM) {
        fetch('/vn-wards.geojson')
          .then(r => r.json())
          .then((data: FeatureCollection) => setWardsGeo(data))
          .catch(console.error);
      }
    }
  }, [viewMode, provincesGeo, wardsGeo, currentZoom]);

  // Calculate average AQI for a region — match by name first, fallback to nearest station
  const getRegionAqi = useCallback((feature: Feature): number => {
    if (!feature.geometry || !('coordinates' in feature.geometry)) return -1;

    const shapeName = (feature.properties?.shapeName ?? feature.properties?.name ?? '') as string;
    if (!shapeName) return -1;

    // Normalize name for fuzzy matching (remove "Tỉnh ", "Thành phố ", diacritics-insensitive)
    const normalize = (s: string) => s
      .replace(/^(Tỉnh |Thành phố |TP\.?\s*)/i, '')
      .trim()
      .toLowerCase();

    const regionNorm = normalize(shapeName);

    // 1. Match stations by name: station.region contains or equals shapeName
    const nameMatched = mappableStations.filter(s => {
      const stationRegion = normalize(s.region);
      // Skip WAQI-XXXX stations for name matching
      if (s.region.startsWith('WAQI-')) return false;
      return stationRegion === regionNorm ||
        stationRegion.includes(regionNorm) ||
        regionNorm.includes(stationRegion);
    });

    if (nameMatched.length > 0) {
      const sum = nameMatched.reduce((acc, s) => acc + s.aqi, 0);
      return Math.round(sum / nameMatched.length);
    }

    // 2. Fallback: find closest station within 0.5 degrees (~55km)
    let totalLat = 0, totalLng = 0, count = 0;
    const flattenCoords = (coords: any[]): void => {
      for (const c of coords) {
        if (typeof c[0] === 'number' && typeof c[1] === 'number') {
          totalLng += c[0];
          totalLat += c[1];
          count++;
        } else {
          flattenCoords(c);
        }
      }
    };
    flattenCoords(feature.geometry.coordinates as any[]);

    if (count === 0) return -1;
    const centLat = totalLat / count;
    const centLng = totalLng / count;

    const nearby = mappableStations.filter(s => {
      const dist = Math.sqrt((s.lat - centLat) ** 2 + (s.lng - centLng) ** 2);
      return dist < 0.5;
    });

    if (nearby.length === 0) return -1;

    // Weighted average by inverse distance
    let weightedSum = 0, weightTotal = 0;
    for (const s of nearby) {
      const dist = Math.max(0.01, Math.sqrt((s.lat - centLat) ** 2 + (s.lng - centLng) ** 2));
      const weight = 1 / dist;
      weightedSum += s.aqi * weight;
      weightTotal += weight;
    }

    return Math.round(weightedSum / weightTotal);
  }, [mappableStations]);

  const regionStyle = useCallback((feature: Feature | undefined): PathOptions => {
    if (!feature) return {};
    const aqi = getRegionAqi(feature);
    const color = aqi >= 0 ? getAQIColorForRegion(aqi) : '#666';
    const isDark = resolvedTheme === 'dark';

    return {
      fillColor: color,
      fillOpacity: aqi >= 0 ? REGION_FILL_OPACITY : REGION_EMPTY_OPACITY,
      color: isDark ? 'hsla(0 0% 100% / 0.14)' : 'hsla(0 0% 0% / 0.1)',
      weight: 0.7,
      fillRule: 'nonzero',
      lineJoin: 'round',
      lineCap: 'round',
    };
  }, [getRegionAqi, resolvedTheme]);

  const heatmapStyle = useCallback((feature: Feature | undefined): PathOptions => {
    if (!feature) return {};
    const aqi = getRegionAqi(feature);
    const color = aqi >= 0 ? getAQIColorForRegion(aqi) : 'transparent';

    return {
      fillColor: color,
      fillOpacity: aqi >= 0 ? 0.45 : 0,
      color: 'transparent',
      weight: 0,
      fillRule: 'nonzero',
    };
  }, [getRegionAqi]);

  const onEachFeature = useCallback((feature: Feature, layer: Layer) => {
    const layerOptions = (layer as any).options;
    if (layerOptions) {
      layerOptions.smoothFactor = 0;
      layerOptions.noClip = true;
    }

    const name = feature.properties?.shapeName || 'Không rõ';
    const aqi = getRegionAqi(feature);
    const label = aqi >= 0 ? getAqiLabel(aqi) : 'Chưa có dữ liệu';
    const color = aqi >= 0 ? getAQIColorForRegion(aqi) : '#999';

    (layer as any).bindPopup(`
      <div style="font-family: system-ui; min-width: 120px;">
        <p style="font-weight: bold; margin: 0 0 4px;">${name}</p>
        <p style="margin: 0; color: ${color}; font-weight: bold;">
          ${aqi >= 0 ? `AQI: ${aqi}` : 'N/A'}
        </p>
        <p style="margin: 2px 0 0; font-size: 11px; opacity: 0.8;">${label}</p>
      </div>
    `);

    (layer as any).on({
      mouseover: (e: any) => {
        e.target.setStyle({ fillOpacity: 0.2, weight: 1.2 });
      },
      mouseout: (e: any) => {
        e.target.setStyle({ fillOpacity: aqi >= 0 ? REGION_FILL_OPACITY : REGION_EMPTY_OPACITY, weight: 0.7 });
      },
    });
  }, [getRegionAqi]);

  const showWards = currentZoom >= WARD_ZOOM;
  const geoData = showWards ? wardsGeo : provincesGeo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-card overflow-hidden h-full"
    >
      <div className="px-4 py-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold font-display text-foreground">Bản đồ chất lượng không khí</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
          {viewMode === 'heatmap' ? 'Bản đồ nhiệt theo mức độ ô nhiễm' :
            viewMode === 'stations' ? 'Nhấn vào trạm để xem chi tiết' : (
              showWards ? 'Ranh giới phường/xã (sau sáp nhập 2025)' : 'Ranh giới tỉnh/thành phố — zoom vào xem phường/xã'
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5 self-start sm:self-auto flex-shrink-0">
          <button
            onClick={() => setViewMode('stations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'stations' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Trạm
          </button>
          {/* <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'heatmap' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Nhiệt
          </button> */}
<button
            onClick={() => setViewMode('regions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'regions' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Khu vực
          </button>
        </div>
      </div>
      <div className="h-[calc(100%-52px)] relative">
        <MapContainer
          center={[16.0, 106.0]}
          zoom={6}
          className="h-full w-full"
          preferCanvas={true}
          zoomControl={true}
          attributionControl={false}
          scrollWheelZoom={false}
        >
          <TileLayer key={tileUrl} url={tileUrl} />
          <FlyToStation station={selectedStation} stations={mappableStations} forceFly={forceFly} />
          <ZoomWatcher onZoomChange={setCurrentZoom} />
          <ViewModeRefresh viewMode={viewMode} />

          {viewMode === 'heatmap' && (
            <>
              {geoData && (
                <GeoJSON
                  key={`heatmap-${showWards ? 'wards' : 'provinces'}-${mappableStations.length}`}
                  data={geoData}
                  style={heatmapStyle}
                  onEachFeature={onEachFeature}
                />
              )}
              {mappableStations.map((station) => (
                <CircleMarker
                  key={`heat-marker-${station.id}`}
                  center={[station.lat, station.lng]}
                  radius={5}
                  pathOptions={{
                    fillColor: getMarkerColor(station.aqi),
                    fillOpacity: 0.9,
                    color: '#fff',
                    weight: 1.5,
                  }}
                  eventHandlers={{
                    click: () => onSelectStation(station),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{station.name}</p>
                      <p style={{ color: getMarkerColor(station.aqi), fontWeight: 'bold' }}>
                        AQI: {station.aqi}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </>
          )}

          {viewMode === 'stations' && (
            <MarkerClusterGroup
              key={`cluster-${viewMode}`}
              maxClusterRadius={25}
              disableClusteringAtZoom={8}
              spiderfyOnMaxZoom
              showCoverageOnHover={false}
              iconCreateFunction={(cluster: any) => {
                const markers = cluster.getAllChildMarkers();
                const worstAqi = Math.max(...markers.map((m: any) => {
                  const s = mappableStations.find(
                    st => Math.abs(st.lat - m.getLatLng().lat) < 0.001 && Math.abs(st.lng - m.getLatLng().lng) < 0.001
                  );
                  return s?.aqi ?? 0;
                }));
                const color = getAqiColor(worstAqi);
                const count = cluster.getChildCount();
                return L.divIcon({
                  html: `<div style="background:${color};color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid rgba(255,255,255,0.6);box-shadow:0 2px 6px rgba(0,0,0,0.3);">${count}</div>`,
                  className: '',
                  iconSize: L.point(36, 36),
                  iconAnchor: L.point(18, 18),
                });
              }}
            >
              {mappableStations.map((station) => {
                const isSelected = station.id === selectedStation?.id;
                const category = getAqiCategory(station.aqi);
                return (
                  <Marker
                    key={station.id}
                    position={[station.lat, station.lng]}
                    icon={createAqiPinIcon(station.aqi, isSelected)}
                    eventHandlers={{
                      click: () => onSelectStation(station),
                    }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-bold text-[13px] leading-tight">{station.name}</p>
                        <p className="text-[11px] opacity-70 mt-0.5">{station.region}</p>
                        <div
                          className="mt-2 rounded-md px-2 py-1.5"
                          style={{
                            backgroundColor: category.color,
                            color: category.textColor,
                          }}
                        >
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black tabular-nums leading-none">
                              {station.aqi}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wide">
                              AQI US
                            </span>
                          </div>
                          <p className="text-[11px] font-medium mt-0.5">{category.label}</p>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                          <div>
                            <span className="opacity-60">PM2.5</span>
                            <br />
                            <span className="font-medium">{station.pm25 ?? '—'} µg/m³</span>
                          </div>
                          <div>
                            <span className="opacity-60">PM10</span>
                            <br />
                            <span className="font-medium">{station.pm10 ?? '—'} µg/m³</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          )}

          {viewMode === 'regions' && geoData && (
            <GeoJSON
              key={`geo-${showWards ? 'wards' : 'provinces'}-${mappableStations.length}`}
              data={geoData}
              style={regionStyle}
              onEachFeature={onEachFeature}
            />
          )}

        </MapContainer>
        <AQILegend />
      </div>
    </motion.div>
  );
}
