import { useQuery } from "@tanstack/react-query";
import { listNotifications } from "@/api/notifications";
import { useAuth } from "@/hooks/useAuth";

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => listNotifications(),
    enabled: Boolean(user),
    refetchInterval: 30_000,
  });
}
