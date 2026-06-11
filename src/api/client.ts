import { USE_MOCK, mockApiRequest } from "@/api/mockDb";

const AIR_QUALITY_API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL;
const SESSION_KEY = "air-quality-fe:user-session";

export function hasAirQualityApi() {
  return USE_MOCK || Boolean(AIR_QUALITY_API_URL);
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
  if (USE_MOCK) {
    return mockApiRequest<T>(path, init);
  }

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
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // body wasn't JSON
    }
    const msg =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message ?? "")
        : "") || `Air Quality API request failed: ${response.status}`;
    throw new ApiError(msg, response.status, payload);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get code(): string | undefined {
    if (this.payload && typeof this.payload === "object") {
      const m = (this.payload as { message?: unknown }).message;
      if (m && typeof m === "object" && "code" in m) {
        return String((m as { code?: unknown }).code ?? "") || undefined;
      }
      if ("code" in (this.payload as Record<string, unknown>)) {
        return String((this.payload as { code?: unknown }).code ?? "") || undefined;
      }
    }
    return undefined;
  }
}
