import { localAPI } from "@/lib/requests";
import { AppSuspenseQueryOptions, TimeoutUri } from "@/types/query";
import { Timeout } from "@/types/timeout";
import { generateQueryKey } from "@/utils/query";
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
}: TimeoutUri & AppSuspenseQueryOptions<Partial<Timeout>>) =>
  useSuspenseQuery({
    queryKey: generateQueryKey.timeout(boutUuid, timeoutNum),
    queryFn: () =>
      localAPI.get<Partial<Timeout>>("timeout", {
        query: { boutUuid, num: timeoutNum }, // TODO: fix alias
      }),
    select: (data) => Object.assign(new Timeout(), data),
    ...options,
  });
