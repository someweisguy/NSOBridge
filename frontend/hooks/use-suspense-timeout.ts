import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { SuspenseQueryOptions, TimeoutUri } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Timeout from the server. This hook is a wrapper for call to
 * TanStack Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Timeout.
 */
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
