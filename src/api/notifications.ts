import { airQualityApiRequest } from "@/api/client";
import type { UserNotification } from "@/types";

export async function listNotifications() {
  return airQualityApiRequest<UserNotification[]>("/notifications");
}
