import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => Boolean(user?.roles.includes("admin")),
    enabled: Boolean(user),
  });
}
