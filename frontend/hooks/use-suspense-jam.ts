import { getJam, Jam } from "@/lib/game/jams";
import { JamUri, AppSuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Jam from the server. This hook is a wrapper for call to TanStack
 * Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Jam.
 */
export const useSuspenseJam = <D = Jam, E = Error>({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & AppSuspenseQueryOptions<Jam, E, D>) =>
  useSuspenseQuery<Jam, E, D>({
    queryKey: Jam.generateKey(boutUuid, periodNum, jamNum),
    queryFn: () => getJam(boutUuid, periodNum, jamNum),
    ...options,
  });
