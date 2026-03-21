import { localAPI } from "@/lib/requests";
import { Jam, TeamJam } from "@/types/jam";
import { AppSuspenseQueryOptions, JamUri } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Jam from the server. This hook is a wrapper for call to TanStack
 * Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Jam.
 */
export const useSuspenseJam = ({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & AppSuspenseQueryOptions<Partial<Jam>>) =>
  useSuspenseQuery<Partial<Jam>, Error, Jam>({
    queryKey: Jam.generateKey(boutUuid, periodNum, jamNum),
    queryFn: () =>
      localAPI.get<Partial<Jam>>("jam", {
        query: { boutUuid, periodNum, jamNum },
      }),
    select: (jam) => {
      jam.teamJams = jam.teamJams!.map((tj) =>
        Object.assign(new TeamJam(), tj),
      );
      return Object.assign(new Jam(), jam);
    },
    ...options,
  });
