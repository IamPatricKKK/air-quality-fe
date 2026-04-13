const AIR_QUALITY_API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL;

export function hasAirQualityApi() {
  return Boolean(AIR_QUALITY_API_URL);
}

export async function airQualityApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!AIR_QUALITY_API_URL) {
    throw new Error("Air Quality API is not configured");
  }

  const response = await fetch(`${AIR_QUALITY_API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Air Quality API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
