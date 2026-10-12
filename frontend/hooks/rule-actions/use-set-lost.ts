import { localAPI } from "@/lib/requests";
import { Team } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetLostProps extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  team: Team;
}

/**
 * Adds or removes lost lead status to the active Jam of the specified Team.
 *
 * @returns A Tanstack Mutation object which can fire the setLost mutator.
 */
export const useSetLost = ({ team, ...options }: UseSetLostProps) =>
  useMutation({
    mutationFn: (lost: boolean) =>
      localAPI.post<void>("bout/team/lost", {
        query: { teamUuid: team.uuid },
        body: lost,
      }),
    ...options,
  });
