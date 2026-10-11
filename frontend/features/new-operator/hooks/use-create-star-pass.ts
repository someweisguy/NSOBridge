import { localAPI } from "@/lib/requests";
import { Team } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseUpdateStarPassProps extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  team: Team;
}

/**
 * Adds or removes a Star Pass to the active Jam of the specified Team.
 *
 * @returns A Tanstack Mutation object which can fire the updateStarPass mutator.
 */
export const useUpdateStarPass = ({
  team,
  ...options
}: UseUpdateStarPassProps) =>
  useMutation({
    mutationFn: (starPass: boolean) =>
      localAPI.post<void>("bout/team/lead", {
        query: { teamUuid: team.uuid },
        body: starPass,
      }),
    ...options,
  });
