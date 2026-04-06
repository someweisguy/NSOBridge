import { localAPI } from "@/lib/requests";
import { AppMutationOptions, TeamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to set the name of the desired Team.
 *
 * @returns A Tanstack Mutation object which can fire the useSetTeamName mutator.
 */
export const useSetTeamName = ({
  boutUuid,
  teamNum,
  ...options
}: TeamUri & AppMutationOptions<void, unknown, string>) =>
  useMutation({
    mutationFn: (newTeamName: string) =>
      localAPI.post<void>("bout/setClockIsRunning", {
        query: { boutUuid, teamNum },
        body: newTeamName,
      }),
    ...options,
  });
