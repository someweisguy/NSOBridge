import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { AppQueryOptions, TimeoutUri } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Timeout from the server. This hook is a wrapper for call to
 * TanStack Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Timeout.
 */
export const useTimeout = <T = null>({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & AppQueryOptions<Timeout | T>) =>
  useQuery({
    queryKey: Timeout.generateKey(boutUuid, timeoutNum),
    queryFn: () => getTimeout(boutUuid, timeoutNum),
    ...options,
  });
