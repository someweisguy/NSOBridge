import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import {
  queryOptions,
  useQuery,
  UseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";

export function timeoutQueryOptions(bout: Bout, num: number) {
  return queryOptions<Timeout>({
    queryKey: Timeout.generateKey(bout.uuid, num),
    queryFn: () => getTimeout(bout.uuid, num),
  });
}

export const useTimeout = <T = null>(
  bout: Bout,
  num: number,
  options?: Omit<UseQueryOptions<Timeout | T>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: Timeout.generateKey(bout.uuid, num),
    queryFn: () => getTimeout(bout.uuid, num),
    ...options,
  });

export const useSuspenseTimeout = (bout: Bout, num: number) =>
  useSuspenseQuery(timeoutQueryOptions(bout, num));
