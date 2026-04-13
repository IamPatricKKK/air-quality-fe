import { useCallback, useEffect, useState } from "react";
import { getUserPreferences, saveUserPreferences } from "@/api/profile";
import { useAuth } from "@/hooks/useAuth";

export function usePinnedStations() {
  const { user } = useAuth();
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setPinnedIds([]);
      return;
    }

    getUserPreferences(user.id).then((prefs) => {
      setPinnedIds(prefs.pinnedStationIds ?? []);
    });
  }, [user]);

  const togglePin = useCallback(async (stationId: string) => {
    if (!user) {
      return;
    }

    const next = pinnedIds.includes(stationId)
      ? pinnedIds.filter((id) => id !== stationId)
      : [...pinnedIds, stationId];

    setPinnedIds(next);
    await saveUserPreferences(user.id, { pinnedStationIds: next });
  }, [pinnedIds, user]);

  const isPinned = useCallback((stationId: string) => pinnedIds.includes(stationId), [pinnedIds]);

  return { pinnedIds, togglePin, isPinned };
}
