import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL ?? "";
const SESSION_KEY = "air-quality-fe:user-session";

interface ObservationUpdate {
  station_id: string;
  station_code?: string;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  observed_at: string;
  provider: string;
}

interface AlertEvent {
  user_id: string;
  alert_id: string;
  station_id: string | null;
  title: string;
  message: string;
  category: string | null;
}

function readToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { access_token?: string };
    return s.access_token ?? null;
  } catch {
    return null;
  }
}

function resolveSocketUrl(): string | null {
  if (!API_URL) return null;
  try {
    const url = new URL(API_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

export function useRealtime(enabled = true) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const token = readToken();
    const socketUrl = resolveSocketUrl();
    if (!token || !socketUrl) return;

    const socket = io(`${socketUrl}/realtime`, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });
    socketRef.current = socket;

    socket.on("observations:updated", (_payload: { updates: ObservationUpdate[]; ts: number }) => {
      queryClient.invalidateQueries({ queryKey: ["stations-with-readings"] });
      queryClient.invalidateQueries({ queryKey: ["station-history"] });
      queryClient.invalidateQueries({ queryKey: ["station-analytics"] });
    });

    socket.on("alert:new", (event: AlertEvent) => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.warning(event.title, {
        description: event.message,
        duration: 8000,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, queryClient]);

  return socketRef;
}
