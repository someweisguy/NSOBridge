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

export const useSetType = (timeout: Timeout) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") => timeout.setType(type),
  });

export const useSetTeam = (timeout: Timeout) =>
  useMutation({
    mutationFn: (team: Team | null) =>
      timeout.setTeam(team == null ? null : team.id),
  });

export const useSetRetained = (timeout: Timeout) =>
  useMutation({
    mutationFn: (retained: boolean) => timeout.setRetained(retained),
  });
