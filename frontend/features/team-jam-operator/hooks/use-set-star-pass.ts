import { localAPI } from "@/lib/requests";
import { Team } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetStarPassProps extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  team: Team;
}

/**
 * Adds or removes a Star Pass to the active Jam of the specified Team.
 *
 * @returns A Tanstack Mutation object which can fire the setStarPass mutator.
 */
export const useSetStarPass = ({ team, ...options }: UseSetStarPassProps) =>
  useMutation({
    mutationFn: (starPass: boolean) =>
      localAPI.post<void>("bout/team/starPass", {
        // TODO: should this be bout/starPass?
        query: { teamUuid: team.uuid },
        body: starPass,
      }),
    ...options,
  });
