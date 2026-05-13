export interface AppUser {
  id: string;
  email: string;
  roles: string[];
  user_metadata: {
    display_name?: string;
  };
}

export interface AppSession {
  access_token: string;
  expires_at: string;
}

export interface AuthPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface StationWithReading {
  id: string;
  name: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
  waqi_station_id: string | null;
  is_active: boolean;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  recorded_at: string;
}

export interface StationHistoryPoint {
  recorded_at: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3?: number | null;
  no2?: number | null;
}

export interface StationAnalytics {
  station: { id: string; code: string; name: string };
  current: {
    aqi: number | null;
    category: string | null;
    pm25: number | null;
    pm10: number | null;
    o3: number | null;
    no2: number | null;
    so2: number | null;
    co: number | null;
    temperature: number | null;
    humidity: number | null;
    wind_speed: number | null;
    observed_at: string | null;
  };
  summary_24h: {
    samples: number;
    aqi_avg: number | null;
    aqi_min: number | null;
    aqi_max: number | null;
    pm25_avg: number | null;
    pm10_avg: number | null;
    category: string | null;
  };
  forecast: {
    slope_per_hour: number | null;
    aqi_next_1h: number | null;
    aqi_next_3h: number | null;
    aqi_next_6h: number | null;
    category_6h: string | null;
  };
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
  station_id?: string;
}

export interface UserPreferences {
  notificationMode: "all" | "selected";
  favoriteRegions: string[];
  pushEnabled: boolean;
  emailEnabled: boolean;
  pinnedStationIds: string[];
  quietHoursEnabled?: boolean;
  quietHoursStartMin?: number;
  quietHoursEndMin?: number;
  location?: {
    lat: number;
    lng: number;
  };
}
