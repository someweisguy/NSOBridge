import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseTimeout = (
  boutUuid: string,
  num: number,
  options?: Omit<SuspenseQueryOptions<Timeout>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery({
    queryKey: Timeout.generateKey(boutUuid, num),
    queryFn: () => getTimeout(boutUuid, num),
    ...options,
  });
