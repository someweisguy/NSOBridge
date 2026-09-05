import { localAPI } from "@/lib/requests";
import { AppMutationOptions, TeamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to set the number of timeouts that the desired Team has remaining.
 *
 * @returns A Tanstack Mutation object which can fire the
 * useSetTeamTimeoutsRemaining mutator.
 */
export const useSetTeamTimeoutsRemaining = ({
  boutUuid,
  teamNum,
  ...options
}: TeamUri & AppMutationOptions<void, unknown, number>) =>
  useMutation({
    mutationFn: (numTimeouts: number) =>
      localAPI.put<void>("bout/teamTimeoutsRemaining", {
        query: { boutUuid, teamNum },
        body: JSON.stringify(numTimeouts),
      }),
    ...options,
  });
