import { Bout } from "@/lib/game/bouts";
import { localAPI } from "@/lib/requests";
import { AppSuspenseQueryOptions, BoutUri } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Bout from the server. This hook is a wrapper for call to TanStack
 * Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Bout.
 */
export const useSuspenseBout = ({
  boutUuid,
  ...options
}: BoutUri & AppSuspenseQueryOptions<Partial<Bout>>) =>
  useSuspenseQuery<Partial<Bout>, Error, Bout>({
    queryKey: Bout.generateKey(boutUuid),
    queryFn: () =>
      localAPI.get<Partial<Bout>>("bout", {
        query: { boutUuid },
      }),
    select: (bout) => Object.assign(new Bout(), bout),
    ...options,
  });
