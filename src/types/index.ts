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
  location?: {
    lat: number;
    lng: number;
  };
}
