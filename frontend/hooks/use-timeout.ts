import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export const useTimeout = (bout: Bout, index: number) =>
  useSuspenseQuery<Timeout>({
    queryKey: Timeout.generateKey(
      bout.seriesId,
      bout.id,
      bout.timeoutIds[index],
    ),
    queryFn: () => getTimeout(bout.timeoutIds[index]),
  });

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
