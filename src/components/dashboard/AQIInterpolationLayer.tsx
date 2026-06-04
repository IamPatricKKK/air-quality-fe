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

// Vietnam bounding polygon (denser points for smoother mask)
const VN_OUTLINE: [number, number][] = [
  [23.39, 102.14], [23.33, 103.42], [22.85, 104.37], [22.70, 105.33],
  [22.46, 105.58], [22.00, 105.63], [21.73, 106.28], [21.57, 106.65],
  [21.48, 107.35], [21.27, 107.60], [21.15, 107.95],
  [20.72, 107.05], [20.35, 106.58], [19.88, 105.95], [19.38, 105.72],
  [18.85, 105.70], [18.48, 105.88], [18.00, 106.18], [17.38, 106.50],
  [16.95, 106.75], [16.58, 107.02], [16.08, 108.02], [15.88, 108.28],
  [15.45, 108.52], [14.98, 108.88], [14.58, 109.00], [13.85, 109.22],
  [13.38, 109.35], [12.68, 109.38], [11.75, 109.15], [11.38, 109.02],
  [10.95, 108.95], [10.58, 108.88], [10.42, 107.62], [10.35, 107.28],
  [10.02, 107.02], [9.85, 106.72], [9.58, 106.25], [9.28, 105.22],
  [8.65, 104.82],
  [8.58, 104.68], [8.82, 104.42], [9.25, 104.85], [9.48, 105.18],
  [9.82, 105.82], [10.05, 106.18], [10.28, 106.42], [10.52, 106.78],
  [10.85, 106.72], [11.08, 106.58], [11.35, 106.38], [11.58, 106.22],
  [11.82, 106.02], [12.08, 106.22], [12.25, 106.52], [12.62, 107.05],
  [12.88, 107.38], [13.48, 107.62], [14.02, 107.72], [14.52, 107.58],
  [14.98, 107.48], [15.58, 107.22], [15.95, 106.72], [16.38, 106.28],
  [16.72, 106.02], [17.08, 105.72], [17.42, 105.58], [17.88, 105.18],
  [18.22, 104.98], [18.68, 104.58], [19.02, 104.42], [19.52, 104.08],
  [19.82, 103.98], [20.22, 103.68], [20.42, 103.58], [20.82, 103.18],
  [21.02, 102.88], [21.48, 102.22], [21.98, 102.05], [22.42, 101.98],
  [23.08, 102.02], [23.39, 102.14],
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

/** Simple box blur on RGBA image data */
function boxBlur(data: Uint8ClampedArray, w: number, h: number, radius: number) {
  const tmp = new Uint8ClampedArray(data.length);
  const d = radius * 2 + 1;

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= w) continue;
        const idx = (y * w + nx) * 4;
        if (data[idx + 3] === 0) continue;
        r += data[idx]; g += data[idx + 1]; b += data[idx + 2]; a += data[idx + 3];
        count++;
      }
      const idx = (y * w + x) * 4;
      if (count > 0) {
        tmp[idx] = r / count; tmp[idx + 1] = g / count; tmp[idx + 2] = b / count; tmp[idx + 3] = a / count;
      }
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        const idx = (ny * w + x) * 4;
        if (tmp[idx + 3] === 0) continue;
        r += tmp[idx]; g += tmp[idx + 1]; b += tmp[idx + 2]; a += tmp[idx + 3];
        count++;
      }
      const idx = (y * w + x) * 4;
      if (count > 0) {
        data[idx] = r / count; data[idx + 1] = g / count; data[idx + 2] = b / count; data[idx + 3] = a / count;
      }
    }
  }
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

        // Higher resolution for smoother output
        const zoom = map.getZoom();
        const scale = zoom >= 8 ? 0.5 : zoom >= 6 ? 0.35 : 0.25;
        const w = Math.ceil(size.x * scale);
        const h = Math.ceil(size.y * scale);

        const topLeft = map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(canvas, topLeft);

        canvas.width = w;
        canvas.height = h;
        canvas.style.width = size.x + 'px';
        canvas.style.height = size.y + 'px';
        canvas.style.imageRendering = 'auto';

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        const baseOpacity = 0.45;
        const power = 2;
        const maxDist = zoom <= 5 ? 8 : zoom <= 7 ? 5 : 3;

        for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            const containerX = px / scale;
            const containerY = py / scale;
            const latlng = map.containerPointToLatLng(L.point(containerX, containerY));

            const lat = latlng.lat;
            const lng = latlng.lng;

            if (lat < 8 || lat > 24 || lng < 101 || lng > 110) continue;
            if (!pointInPolygon(lat, lng)) continue;

            // IDW interpolation
            let weightedSum = 0;
            let weightTotal = 0;
            for (const s of stationData) {
              const dlat = lat - s.lat;
              const dlng = lng - s.lng;
              const distSq = dlat * dlat + dlng * dlng;
              if (distSq < 0.0001) { weightedSum = s.aqi; weightTotal = 1; break; }
              const dist = Math.sqrt(distSq);
              if (dist > maxDist) continue;
              const w = 1 / Math.pow(dist, power);
              weightedSum += s.aqi * w;
              weightTotal += w;
            }
            if (weightTotal === 0) continue;

            const aqi = weightedSum / weightTotal;
            const [r, g, b] = interpolateAQIColor(aqi);
            const idx = (py * w + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = Math.round(baseOpacity * 255);
          }
        }

        // Apply blur for smooth gradient effect
        const blurRadius = Math.max(1, Math.round(2 * scale));
        boxBlur(data, w, h, blurRadius);
        boxBlur(data, w, h, blurRadius);

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
