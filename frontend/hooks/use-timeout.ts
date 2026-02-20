import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { QueryOptions, SuspenseQueryOptions } from "@/types/query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

// TODO: extract to separate file
export const useSuspenseTimeout = (
  bout: Bout,
  num: number,
  options?: Omit<SuspenseQueryOptions<Timeout>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery({
    queryKey: Timeout.generateKey(bout.uuid, num),
    queryFn: () => getTimeout(bout.uuid, num),
    ...options,
  });

export const useTimeout = <T = null>(
  bout: Bout,
  num: number,
  options?: Omit<QueryOptions<Timeout | T>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: Timeout.generateKey(bout.uuid, num),
    queryFn: () => getTimeout(bout.uuid, num),
    ...options,
  });
