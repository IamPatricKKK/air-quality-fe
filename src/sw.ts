/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.hostname.endsWith(".basemaps.cartocdn.com"),
  new CacheFirst({
    cacheName: "map-tiles",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.endsWith(".geojson"),
  new CacheFirst({
    cacheName: "geojson-regions",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  }),
);

registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/v1/stations") ||
    url.pathname.startsWith("/api/v1/analytics"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 10 }),
    ],
  }),
);

interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  stationId?: string;
  aqi?: number;
  category?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  let payload: PushPayload = {};

  if (event.data) {
    try {
      payload = event.data.json() as PushPayload;
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title ?? "Chất Lượng Không Khí Việt Nam";
  const body = payload.body ?? "Có cảnh báo chất lượng không khí mới.";
  const url = payload.url ?? (payload.stationId ? `/stations/${payload.stationId}` : "/");

  const showPromise = self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag ?? "air-quality-alert",
    data: { url },
    requireInteraction: false,
  });

  event.waitUntil(showPromise);
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const target = (event.notification.data as { url?: string } | null)?.url ?? "/";

  const openPromise = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      for (const client of clients) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && "focus" in client) {
          client.postMessage({ type: "notification-click", url: target });
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    });

  event.waitUntil(openPromise);
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
