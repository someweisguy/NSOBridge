import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

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
