import { localAPI } from "@/lib/requests";
import { Jam, TeamJam } from "@/types/jam";
import { AppQueryOptions, JamUri } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Jam from the server. This hook is a wrapper for call to TanStack
 * Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Jam.
 */
export const useJam = ({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & AppQueryOptions<Partial<Jam>>) =>
  useQuery({
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
