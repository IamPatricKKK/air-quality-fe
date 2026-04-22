/**
 * AQI Pin — Custom Leaflet divIcon hiển thị số AQI trong một vòng tròn màu,
 * gần với style pin của iqair.com/air-quality-map.
 *
 * Sử dụng: <Marker position={...} icon={createAqiPinIcon(aqi, isSelected)} />
 */

import L from 'leaflet';
import { getAqiCategory } from '@/lib/aqi';

export function createAqiPinIcon(aqi: number | null, isSelected = false): L.DivIcon {
  const category = getAqiCategory(aqi);
  const bg = category.color;
  const fg = category.textColor;
  const size = isSelected ? 40 : 32;
  const halo = isSelected ? 'box-shadow: 0 0 0 3px rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.35);' : 'box-shadow: 0 1px 4px rgba(0,0,0,0.25);';

  // Nếu không có AQI thì hiển thị dấu "—"
  const display = aqi === null || aqi === undefined || Number.isNaN(aqi) ? '—' : Math.round(aqi);

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${bg};
      color: ${fg};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: ${isSelected ? 14 : 12}px;
      font-family: system-ui, -apple-system, sans-serif;
      border: 2px solid rgba(255,255,255,0.95);
      ${halo}
      transition: transform 0.15s ease;
      cursor: pointer;
    ">
      ${display}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'aqi-pin-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}
