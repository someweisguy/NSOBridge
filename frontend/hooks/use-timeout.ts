import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { QueryOptions, SuspenseQueryOptions } from "@/types/hooks";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseTimeout = (
  bout: Bout,
  num: number,
  options?: SuspenseQueryOptions<Timeout>,
) =>
  useSuspenseQuery({
    queryKey: Timeout.generateKey(bout.uuid, num),
    queryFn: () => getTimeout(bout.uuid, num),
    ...options,
  });

export const useTimeout = <T = null>(
  bout: Bout,
  num: number,
  options?: QueryOptions<Timeout | T>,
) =>
  useQuery({
    queryKey: Timeout.generateKey(bout.uuid, num),
    queryFn: () => getTimeout(bout.uuid, num),
    ...options,
  });
