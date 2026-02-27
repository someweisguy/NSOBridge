import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useTimeout = <T = null>(
  boutUuid: string,
  num: number,
  options?: Omit<QueryOptions<Timeout | T>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: Timeout.generateKey(boutUuid, num),
    queryFn: () => getTimeout(boutUuid, num),
    ...options,
  });
