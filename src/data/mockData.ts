export interface Station {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  temperature: number;
  humidity: number;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  stationId: string;
  stationName: string;
  type: 'warning' | 'danger' | 'critical';
  message: string;
  aqi: number;
  timestamp: string;
  read: boolean;
}

export type AQILevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
}

export function getAQILabel(level: AQILevel): string {
  const labels: Record<AQILevel, string> = {
    'good': 'Tốt',
    'moderate': 'Trung bình',
    'unhealthy-sensitive': 'Không tốt cho nhóm nhạy cảm',
    'unhealthy': 'Không tốt',
    'very-unhealthy': 'Rất không tốt',
    'hazardous': 'Nguy hại',
  };
  return labels[level];
}

export function getAQIColorClass(level: AQILevel): string {
  const colors: Record<AQILevel, string> = {
    'good': 'aqi-good',
    'moderate': 'aqi-moderate',
    'unhealthy-sensitive': 'aqi-unhealthy-sensitive',
    'unhealthy': 'aqi-unhealthy',
    'very-unhealthy': 'aqi-very-unhealthy',
    'hazardous': 'aqi-hazardous',
  };
  return colors[level];
}

export function getAQIBgClass(level: AQILevel): string {
  const colors: Record<AQILevel, string> = {
    'good': 'bg-aqi-good',
    'moderate': 'bg-aqi-moderate',
    'unhealthy-sensitive': 'bg-aqi-unhealthy-sensitive',
    'unhealthy': 'bg-aqi-unhealthy',
    'very-unhealthy': 'bg-aqi-very-unhealthy',
    'hazardous': 'bg-aqi-hazardous',
  };
  return colors[level];
}

export const stations: Station[] = [
  {
    id: '1', name: 'Trạm Nha Trang', region: 'Khánh Hòa',
    lat: 12.2388, lng: 109.1967, aqi: 42,
    pm25: 12.5, pm10: 28.3, o3: 35.2, no2: 18.1, so2: 5.3, co: 0.4,
    temperature: 28, humidity: 75, lastUpdated: '2026-03-26T10:30:00',
  },
  {
    id: '2', name: 'Trạm Cam Ranh', region: 'Khánh Hòa',
    lat: 11.9214, lng: 109.1590, aqi: 38,
    pm25: 10.2, pm10: 22.1, o3: 30.5, no2: 12.4, so2: 3.8, co: 0.3,
    temperature: 29, humidity: 72, lastUpdated: '2026-03-26T10:25:00',
  },
  {
    id: '3', name: 'Trạm TP.HCM - Quận 1', region: 'TP. Hồ Chí Minh',
    lat: 10.7769, lng: 106.7009, aqi: 125,
    pm25: 55.3, pm10: 78.2, o3: 68.1, no2: 45.3, so2: 15.2, co: 1.2,
    temperature: 32, humidity: 68, lastUpdated: '2026-03-26T10:28:00',
  },
  {
    id: '4', name: 'Trạm Hà Nội - Hoàn Kiếm', region: 'Hà Nội',
    lat: 21.0285, lng: 105.8542, aqi: 168,
    pm25: 88.5, pm10: 120.3, o3: 72.4, no2: 58.2, so2: 22.1, co: 1.8,
    temperature: 25, humidity: 80, lastUpdated: '2026-03-26T10:32:00',
  },
  {
    id: '5', name: 'Trạm Đà Nẵng', region: 'Đà Nẵng',
    lat: 16.0544, lng: 108.2022, aqi: 65,
    pm25: 22.1, pm10: 38.5, o3: 42.3, no2: 25.6, so2: 8.4, co: 0.6,
    temperature: 27, humidity: 78, lastUpdated: '2026-03-26T10:30:00',
  },
  {
    id: '6', name: 'Trạm Hải Phòng', region: 'Hải Phòng',
    lat: 20.8449, lng: 106.6881, aqi: 142,
    pm25: 62.8, pm10: 95.1, o3: 58.9, no2: 42.1, so2: 18.3, co: 1.4,
    temperature: 24, humidity: 82, lastUpdated: '2026-03-26T10:27:00',
  },
  {
    id: '7', name: 'Trạm Cần Thơ', region: 'Cần Thơ',
    lat: 10.0452, lng: 105.7469, aqi: 78,
    pm25: 30.2, pm10: 45.8, o3: 38.7, no2: 22.3, so2: 9.1, co: 0.7,
    temperature: 31, humidity: 74, lastUpdated: '2026-03-26T10:29:00',
  },
  {
    id: '8', name: 'Trạm Huế', region: 'Thừa Thiên Huế',
    lat: 16.4637, lng: 107.5909, aqi: 52,
    pm25: 16.8, pm10: 32.4, o3: 36.1, no2: 19.5, so2: 6.2, co: 0.5,
    temperature: 26, humidity: 85, lastUpdated: '2026-03-26T10:31:00',
  },
  {
    id: '9', name: 'Trạm Bắc Ninh', region: 'Bắc Ninh',
    lat: 21.1860, lng: 106.0763, aqi: 195,
    pm25: 105.2, pm10: 145.8, o3: 82.3, no2: 65.1, so2: 28.4, co: 2.1,
    temperature: 23, humidity: 78, lastUpdated: '2026-03-26T10:26:00',
  },
  {
    id: '10', name: 'Trạm Đà Lạt', region: 'Lâm Đồng',
    lat: 11.9404, lng: 108.4583, aqi: 25,
    pm25: 6.3, pm10: 15.2, o3: 22.1, no2: 8.4, so2: 2.1, co: 0.2,
    temperature: 20, humidity: 88, lastUpdated: '2026-03-26T10:30:00',
  },
];

export const alerts: Alert[] = [
  {
    id: '1', stationId: '9', stationName: 'Trạm Bắc Ninh',
    type: 'critical', message: 'AQI vượt mức 190 - Mức nguy hiểm cao!',
    aqi: 195, timestamp: '2026-03-26T10:26:00', read: false,
  },
  {
    id: '2', stationId: '4', stationName: 'Trạm Hà Nội - Hoàn Kiếm',
    type: 'danger', message: 'AQI vượt mức 150 - Không tốt cho sức khỏe',
    aqi: 168, timestamp: '2026-03-26T10:32:00', read: false,
  },
  {
    id: '3', stationId: '6', stationName: 'Trạm Hải Phòng',
    type: 'warning', message: 'AQI vượt ngưỡng 140 - Cảnh báo nhóm nhạy cảm',
    aqi: 142, timestamp: '2026-03-26T10:27:00', read: true,
  },
  {
    id: '4', stationId: '3', stationName: 'Trạm TP.HCM - Quận 1',
    type: 'warning', message: 'AQI vượt ngưỡng 120 - Cảnh báo nhóm nhạy cảm',
    aqi: 125, timestamp: '2026-03-26T10:28:00', read: true,
  },
];

export function generateHistoryData(stationId: string) {
  const baseAqi = stations.find(s => s.id === stationId)?.aqi || 50;
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    const variance = Math.sin(i * 0.5) * 20 + (Math.random() - 0.5) * 15;
    data.push({
      time: `${hour.getHours().toString().padStart(2, '0')}:00`,
      aqi: Math.max(5, Math.round(baseAqi + variance)),
      pm25: Math.max(2, +(baseAqi * 0.45 + variance * 0.3).toFixed(1)),
      pm10: Math.max(5, +(baseAqi * 0.7 + variance * 0.4).toFixed(1)),
    });
  }
  return data;
}
