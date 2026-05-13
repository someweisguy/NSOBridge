import { localAPI } from "@/lib/requests";
import { AppMutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Adds a star pass to the jammer of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamStarPass mutator.
 */
export const useTeamJamAddStarPass = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...options
}: TeamJamUri & AppMutationOptions<void, unknown, boolean>) =>
  useMutation({
    mutationFn: (starPass: boolean) =>
      localAPI.post<void>("bout/addStarPass", {
        query: {
          boutUuid,
          periodNum,
          jamNum,
          teamNum,
        },
        body: starPass,
      }),
    ...options,
  });
