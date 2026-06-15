import { airQualityApiRequest } from "@/api/client";
import type { UserNotification } from "@/types";

export async function listNotifications() {
  return airQualityApiRequest<UserNotification[]>("/notifications");
}

export async function markNotificationRead(id: string) {
  return airQualityApiRequest<{ success: boolean }>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  return airQualityApiRequest<{ success: boolean }>("/notifications/read-all", {
    method: "PATCH",
  });
}
