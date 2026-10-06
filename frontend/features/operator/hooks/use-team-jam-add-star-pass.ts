import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseTeamJamAddStarPassProps extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  jamUuid: string;
  teamNum: number;
}

/**
 * Adds a star pass to the jammer of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamStarPass mutator.
 */
export const useTeamJamAddStarPass = ({
  jamUuid,
  teamNum,
  ...options
}: UseTeamJamAddStarPassProps) =>
  useMutation({
    mutationFn: (starPass: boolean) =>
      localAPI.post<void>("bout/addStarPass", {
        query: {
          jamUuid,
          teamNum,
        },
        body: starPass,
      }),
    ...options,
  });
