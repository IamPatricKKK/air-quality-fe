import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "air-quality-fe:compare-stations";
const MAX_COMPARE = 3;

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

export function useCompareStations() {
  const [ids, setIds] = useState<string[]>(read);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setIds(read());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (stationId: string): { ok: boolean; reason?: "limit" } => {
      const current = read();
      if (current.includes(stationId)) {
        persist(current.filter((id) => id !== stationId));
        return { ok: true };
      }
      if (current.length >= MAX_COMPARE) {
        return { ok: false, reason: "limit" };
      }
      persist([...current, stationId]);
      return { ok: true };
    },
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);
  const isCompared = useCallback((stationId: string) => ids.includes(stationId), [ids]);

  return { ids, toggle, clear, isCompared, max: MAX_COMPARE };
}
