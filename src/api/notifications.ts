import { hasAirQualityApi, airQualityApiRequest } from "@/api/client";
import { listNotificationsMock } from "@/api/mock";
import type { UserNotification } from "@/types";

export async function listNotifications() {
  if (!hasAirQualityApi()) {
    return listNotificationsMock();
  }

  return airQualityApiRequest<UserNotification[]>("/notifications");
}
