import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Station } from '@/data/mockData';

const AQI_COLOR_STOPS: [number, [number, number, number]][] = [
  [0, [101, 196, 102]],
  [50, [101, 196, 102]],
  [51, [234, 179, 8]],
  [100, [234, 179, 8]],
  [101, [249, 150, 60]],
  [150, [249, 115, 22]],
  [151, [239, 68, 68]],
  [200, [220, 38, 38]],
  [201, [168, 85, 247]],
  [300, [139, 92, 246]],
  [301, [127, 29, 29]],
  [500, [127, 29, 29]],
];

function interpolateAQIColor(aqi: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(500, aqi));
  for (let i = 0; i < AQI_COLOR_STOPS.length - 1; i++) {
    const [v0, c0] = AQI_COLOR_STOPS[i];
    const [v1, c1] = AQI_COLOR_STOPS[i + 1];
    if (clamped >= v0 && clamped <= v1) {
      const t = v1 === v0 ? 0 : (clamped - v0) / (v1 - v0);
      return [
        Math.round(c0[0] + t * (c1[0] - c0[0])),
        Math.round(c0[1] + t * (c1[1] - c0[1])),
        Math.round(c0[2] + t * (c1[2] - c0[2])),
      ];
    }
  }
  return AQI_COLOR_STOPS[AQI_COLOR_STOPS.length - 1][1];
}

function idwInterpolate(
  lat: number,
  lng: number,
  stations: { lat: number; lng: number; aqi: number }[],
  power: number = 2.5,
  maxDist: number = 5
): number | null {
  let weightedSum = 0;
  let weightTotal = 0;

  for (const s of stations) {
    const dlat = lat - s.lat;
    const dlng = lng - s.lng;
    const distSq = dlat * dlat + dlng * dlng;

    if (distSq < 0.0001) return s.aqi;
    
    const dist = Math.sqrt(distSq);
    if (dist > maxDist) continue;

    const w = 1 / Math.pow(dist, power);
    weightedSum += s.aqi * w;
    weightTotal += w;
  }

  return weightTotal > 0 ? weightedSum / weightTotal : null;
}

// Rough Vietnam outline for masking
const VN_OUTLINE: [number, number][] = [
  [23.4, 102.1], [23.3, 103.4], [22.8, 104.4], [22.7, 105.3],
  [22.0, 105.6], [21.6, 106.6], [21.5, 107.5], [21.2, 107.9],
  [20.7, 107.0], [20.3, 106.6], [19.9, 105.9], [19.4, 105.7],
  [18.5, 105.9], [18.0, 106.2], [17.4, 106.5], [16.6, 107.0],
  [16.1, 108.0], [15.5, 108.5], [14.6, 109.0], [13.8, 109.2],
  [12.7, 109.4], [11.4, 109.0], [10.6, 108.9], [10.4, 107.3],
  [10.0, 107.0], [9.8, 106.7], [9.3, 105.2], [8.6, 104.8],
  [8.8, 104.4], [9.3, 104.9], [9.8, 105.8], [10.3, 106.4],
  [10.5, 106.8], [11.0, 106.7], [11.4, 106.2], [11.8, 106.0],
  [12.2, 106.5], [12.9, 107.4], [14.0, 107.7], [14.7, 107.5],
  [15.6, 107.2], [16.0, 106.7], [16.7, 106.0], [17.4, 105.6],
  [18.2, 105.0], [19.0, 104.4], [19.8, 104.0], [20.4, 103.6],
  [21.0, 102.9], [21.5, 102.2], [22.4, 102.0], [23.4, 102.1],
];

function pointInPolygon(lat: number, lng: number): boolean {
  let inside = false;
  const poly = VN_OUTLINE;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i];
    const [yj, xj] = poly[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

interface AQIInterpolationLayerProps {
  stations: Station[];
}

export function AQIInterpolationLayer({ stations }: AQIInterpolationLayerProps) {
  const map = useMap();
  const canvasLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!stations.length) return;

    const stationData = stations.map(s => ({ lat: s.lat, lng: s.lng, aqi: s.aqi }));

    const CanvasOverlay = L.Layer.extend({
      onAdd(this: any, map: L.Map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-layer') as HTMLCanvasElement;
        this._canvas.style.position = 'absolute';
        this._canvas.style.pointerEvents = 'none';
        this._canvas.style.zIndex = '200';

        const pane = map.getPane('overlayPane');
        if (pane) pane.appendChild(this._canvas);

        map.on('moveend zoomend resize', this._redraw, this);
        this._redraw();
      },

      onRemove(this: any, map: L.Map) {
        map.off('moveend zoomend resize', this._redraw, this);
        if (this._canvas?.parentNode) {
          this._canvas.parentNode.removeChild(this._canvas);
        }
      },

      _redraw(this: any) {
        const map = this._map;
        if (!map) return;

        const size = map.getSize();
        const canvas = this._canvas as HTMLCanvasElement;
        
        // Low-res for performance, then upscale
        const scale = 0.2;
        const w = Math.ceil(size.x * scale);
        const h = Math.ceil(size.y * scale);

        // Position canvas at the correct map layer offset
        const topLeft = map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(canvas, topLeft);
        
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = size.x + 'px';
        canvas.style.height = size.y + 'px';

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        const zoom = map.getZoom();
        const baseOpacity = zoom <= 6 ? 0.5 : zoom <= 8 ? 0.45 : 0.4;
        const maxDist = zoom <= 6 ? 6 : zoom <= 8 ? 4 : 3;

        for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            // Convert canvas pixel to container point, then to latlng
            const containerX = px / scale;
            const containerY = py / scale;
            const latlng = map.containerPointToLatLng(L.point(containerX, containerY));
            
            const lat = latlng.lat;
            const lng = latlng.lng;

            // Quick bounds check
            if (lat < 8 || lat > 24 || lng < 101 || lng > 110) continue;

            // Check Vietnam outline
            if (!pointInPolygon(lat, lng)) continue;

            const aqi = idwInterpolate(lat, lng, stationData, 2.5, maxDist);
            if (aqi === null) continue;

            const [r, g, b] = interpolateAQIColor(aqi);
            const idx = (py * w + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = Math.round(baseOpacity * 255);
          }
        }

        ctx.putImageData(imageData, 0, 0);
      },
    });

    const layer = new CanvasOverlay();
    layer.addTo(map);
    canvasLayerRef.current = layer;

    return () => {
      if (canvasLayerRef.current) {
        map.removeLayer(canvasLayerRef.current);
        canvasLayerRef.current = null;
      }
    };
  }, [map, stations]);

  return null;
}
