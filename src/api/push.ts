import { airQualityApiRequest } from "@/api/client";

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}

export function subscribePush(payload: PushSubscriptionPayload) {
  return airQualityApiRequest<{ id: string }>("/push/subscribe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function unsubscribePush(endpoint: string) {
  return airQualityApiRequest<{ success: boolean }>("/push/subscribe", {
    method: "DELETE",
    body: JSON.stringify({ endpoint }),
  });
}
