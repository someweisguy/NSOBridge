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
    mutationFn: (teamId: number | null) => timeout.setTeam(teamId),
  });

export const useSetRetained = (timeout: Timeout) =>
  useMutation({
    mutationFn: (retained: boolean) => timeout.setRetained(retained),
  });
