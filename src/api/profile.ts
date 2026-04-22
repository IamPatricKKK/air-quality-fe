import { airQualityApiRequest } from "@/api/client";
import type { UserPreferences } from "@/types";

export async function getUserPreferences(userId: string) {
  return airQualityApiRequest<UserPreferences>(`/users/preferences?userId=${encodeURIComponent(userId)}`);
}

export async function saveUserPreferences(userId: string, next: Partial<UserPreferences>) {
  return airQualityApiRequest<UserPreferences>(`/users/preferences?userId=${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      userId,
      ...next,
    }),
  });
}
