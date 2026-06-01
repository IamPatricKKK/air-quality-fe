import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUserPreferences, saveUserPreferences } from "@/api/profile";
import { useAuth } from "@/hooks/useAuth";

export function usePinnedStations() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      toast.info("Đăng nhập để ghim địa điểm yêu thích", {
        description: "Ghim trạm giúp bạn theo dõi nhanh các khu vực quan tâm.",
        action: { label: "Đăng nhập", onClick: () => navigate("/auth") },
      });
      return;
    }

    const next = pinnedIds.includes(stationId)
      ? pinnedIds.filter((id) => id !== stationId)
      : [...pinnedIds, stationId];

    setPinnedIds(next);
    await saveUserPreferences(user.id, { pinnedStationIds: next });
  }, [pinnedIds, user, navigate]);

  const isPinned = useCallback((stationId: string) => pinnedIds.includes(stationId), [pinnedIds]);

  return { pinnedIds, togglePin, isPinned };
}
