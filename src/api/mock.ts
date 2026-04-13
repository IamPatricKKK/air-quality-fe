import { alerts, generateHistoryData, stations } from "@/data/mockData";
import type {
  AppSession,
  AppUser,
  AuthPayload,
  StationHistoryPoint,
  StationWithReading,
  UserNotification,
  UserPreferences,
} from "@/types";

const SESSION_KEY = "air-quality-fe:user-session";
const USER_KEY = "air-quality-fe:user";
const PREFS_PREFIX = "air-quality-fe:user-prefs:";

function toUserId(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildUser(email: string, displayName?: string): AppUser {
  return {
    id: toUserId(email),
    email,
    roles: email.includes("admin") ? ["user", "admin"] : ["user"],
    user_metadata: {
      display_name: displayName || email.split("@")[0],
    },
  };
}

function defaultPreferences(): UserPreferences {
  return {
    notificationMode: "all",
    favoriteRegions: [],
    pushEnabled: true,
    emailEnabled: true,
    pinnedStationIds: [],
  };
}

function readPreferences(userId: string): UserPreferences {
  const raw = localStorage.getItem(`${PREFS_PREFIX}${userId}`);
  if (!raw) {
    return defaultPreferences();
  }

  try {
    return {
      ...defaultPreferences(),
      ...JSON.parse(raw),
    };
  } catch {
    return defaultPreferences();
  }
}

function writePreferences(userId: string, prefs: UserPreferences) {
  localStorage.setItem(`${PREFS_PREFIX}${userId}`, JSON.stringify(prefs));
}

export function getCurrentSession(): { user: AppUser; session: AppSession } | null {
  const rawUser = localStorage.getItem(USER_KEY);
  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawUser || !rawSession) {
    return null;
  }

  try {
    return {
      user: JSON.parse(rawUser) as AppUser,
      session: JSON.parse(rawSession) as AppSession,
    };
  } catch {
    return null;
  }
}

export async function signInMock(payload: AuthPayload) {
  const user = buildUser(payload.email);
  const session: AppSession = {
    access_token: `mock-token-${user.id}`,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { user, session };
}

export async function signUpMock(payload: AuthPayload) {
  const user = buildUser(payload.email, payload.displayName);
  const session: AppSession = {
    access_token: `mock-token-${user.id}`,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  const prefs = readPreferences(user.id);
  writePreferences(user.id, prefs);

  return { user, session };
}

export async function signOutMock() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export async function listStationsMock(): Promise<StationWithReading[]> {
  return stations.map((station) => ({
    id: station.id,
    name: station.name,
    region: station.region,
    city: station.region,
    lat: station.lat,
    lng: station.lng,
    waqi_station_id: null,
    is_active: true,
    aqi: station.aqi,
    pm25: station.pm25,
    pm10: station.pm10,
    o3: station.o3,
    no2: station.no2,
    so2: station.so2,
    co: station.co,
    temperature: station.temperature,
    humidity: station.humidity,
    wind_speed: 3.2,
    recorded_at: station.lastUpdated,
  }));
}

export async function getStationHistoryMock(stationId: string): Promise<StationHistoryPoint[]> {
  return generateHistoryData(stationId).map((point, index) => ({
    recorded_at: new Date(Date.now() - (23 - index) * 3600_000).toISOString(),
    aqi: point.aqi,
    pm25: point.pm25,
    pm10: point.pm10,
  }));
}

export async function listNotificationsMock(): Promise<UserNotification[]> {
  return alerts.map((alert) => ({
    id: alert.id,
    title: alert.stationName,
    message: alert.message,
    is_read: alert.read,
    created_at: alert.timestamp,
    type: alert.type,
    station_id: alert.stationId,
  }));
}

export async function getUserPreferencesMock(userId: string) {
  return readPreferences(userId);
}

export async function saveUserPreferencesMock(userId: string, next: Partial<UserPreferences>) {
  const merged = {
    ...readPreferences(userId),
    ...next,
  };

  writePreferences(userId, merged);
  return merged;
}
