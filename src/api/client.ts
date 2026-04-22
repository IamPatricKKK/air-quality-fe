const AIR_QUALITY_API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL;
const SESSION_KEY = "air-quality-fe:user-session";

export function hasAirQualityApi() {
  return Boolean(AIR_QUALITY_API_URL);
}

function getAuthorizationHeader() {
  const rawSession = localStorage.getItem(SESSION_KEY);
  if (!rawSession) {
    return undefined;
  }

  try {
    const session = JSON.parse(rawSession) as { access_token?: string };
    return session.access_token ? `Bearer ${session.access_token}` : undefined;
  } catch {
    return undefined;
  }
}

export async function airQualityApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!AIR_QUALITY_API_URL) {
    throw new Error("Air Quality API is not configured");
  }

  const authorization = getAuthorizationHeader();

  const response = await fetch(`${AIR_QUALITY_API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authorization ? { Authorization: authorization } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Air Quality API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
