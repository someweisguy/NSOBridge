import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { SuspenseQueryOptions, TimeoutUri } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseTimeout = ({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & Omit<SuspenseQueryOptions<Timeout>, "queryKey" | "queryFn">) =>
  useSuspenseQuery({
    queryKey: Timeout.generateKey(boutUuid, timeoutNum),
    queryFn: () => getTimeout(boutUuid, timeoutNum),
    ...options,
  });
