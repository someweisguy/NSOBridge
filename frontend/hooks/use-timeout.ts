import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

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
