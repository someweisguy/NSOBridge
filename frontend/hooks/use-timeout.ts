import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { QueryOptions, TimeoutUri } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useTimeout = <T = null>({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & Omit<QueryOptions<Timeout | T>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: Timeout.generateKey(boutUuid, timeoutNum),
    queryFn: () => getTimeout(boutUuid, timeoutNum),
    ...options,
  });
