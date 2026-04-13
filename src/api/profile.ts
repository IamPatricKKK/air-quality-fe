import { hasAirQualityApi, airQualityApiRequest } from "@/api/client";
import { getUserPreferencesMock, saveUserPreferencesMock } from "@/api/mock";
import type { UserPreferences } from "@/types";

export async function getUserPreferences(userId: string) {
  if (!hasAirQualityApi()) {
    return getUserPreferencesMock(userId);
  }

  return airQualityApiRequest<UserPreferences>(`/users/preferences?userId=${encodeURIComponent(userId)}`);
}

export async function saveUserPreferences(userId: string, next: Partial<UserPreferences>) {
  if (!hasAirQualityApi()) {
    return saveUserPreferencesMock(userId, next);
  }

  return airQualityApiRequest<UserPreferences>(`/users/preferences?userId=${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      userId,
      ...next,
    }),
  });
}
