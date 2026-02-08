import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import {
  queryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

export function timeoutQueryOptions(bout: Bout, num: number) {
  return queryOptions<Timeout>({
    queryKey: Timeout.generateKey(bout.uuid, num),
    queryFn: () => getTimeout(bout.uuid, num),
  });
}

export const useTimeout = (bout: Bout, num: number) =>
  useQuery(timeoutQueryOptions(bout, num));

export const useSuspenseTimeout = (bout: Bout, num: number) =>
  useSuspenseQuery(timeoutQueryOptions(bout, num));

export const useSetType = (timeout: Timeout) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") => timeout.setType(type),
  });

export const useSetTeam = (timeout: Timeout) =>
  useMutation({
    mutationFn: (teamNum: number | null) => timeout.setTeam(teamNum),
  });

export const useSetRetained = (timeout: Timeout) =>
  useMutation({
    mutationFn: (retained: boolean) => timeout.setRetained(retained),
  });
