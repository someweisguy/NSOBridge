import { Team } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export default function useTimeout(
  boutId: number,
  index: number,
): Timeout | null {
  const { data } = useSuspenseQuery<Timeout | null>({
    queryKey: Timeout.generateKey(boutId, index),
    queryFn: () => getTimeout(boutId, index),
  });

  return data;
}

export function useSetType(timeout: Timeout) {
  return useMutation({
    mutationFn: (type: "timeout" | "review") => timeout.setType(type),
  });
}

export function useSetTeam(timeout: Timeout) {
  return useMutation({
    mutationFn: (team: Team | null) =>
      timeout.setTeam(team == null ? null : team.id),
  });
}

export function useSetRetained(timeout: Timeout) {
  return useMutation({
    mutationFn: (retained: boolean) => timeout.setRetained(retained),
  });
}
