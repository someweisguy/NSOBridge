import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import {
  useQuery,
  UseQueryOptions,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export const useSuspenseTimeout = (
  bout: Bout,
  num: number,
  options?: Omit<UseSuspenseQueryOptions<Timeout>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery({
    queryKey: Timeout.generateKey(bout.uuid, num),
    queryFn: () => getTimeout(bout.uuid, num),
    ...options,
  });

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
