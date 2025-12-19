import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export const useTimeout = (boutId: number, index: number) =>
  useSuspenseQuery<Timeout | null>({
    queryKey: Timeout.generateKey(boutId, index),
    queryFn: () => getTimeout(boutId, index),
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
