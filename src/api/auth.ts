import { hasAirQualityApi, airQualityApiRequest } from "@/api/client";
import { getCurrentSession, signInMock, signOutMock, signUpMock } from "@/api/mock";
import type { AppSession, AppUser, AuthPayload } from "@/types";

const SESSION_KEY = "air-quality-fe:user-session";
const USER_KEY = "air-quality-fe:user";

interface AuthResponse {
  user: AppUser;
  session: AppSession;
}

function readStoredSession() {
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

function persistSession(payload: AuthResponse) {
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload.session));
}

export async function signIn(payload: AuthPayload) {
  if (!hasAirQualityApi()) {
    return signInMock(payload);
  }

  const result = await airQualityApiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  persistSession(result);
  return result;
}

export async function signUp(payload: AuthPayload) {
  if (!hasAirQualityApi()) {
    return signUpMock(payload);
  }

  const result = await airQualityApiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  persistSession(result);
  return result;
}

export async function signOut() {
  if (!hasAirQualityApi()) {
    return signOutMock();
  }

  await airQualityApiRequest("/auth/logout", { method: "POST" });
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredSession() {
  if (!hasAirQualityApi()) {
    return getCurrentSession();
  }

  return readStoredSession();
}
