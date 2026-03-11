import { setStarPass } from "@/lib/game/jams";
import { MutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Adds a star pass to the jammer of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the setStarPass mutator.
 */
export const useTeamJamAddStarPass = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...options
}: TeamJamUri & MutationOptions<void, unknown, boolean>) =>
  useMutation({
    mutationFn: (starPass: boolean) =>
      setStarPass(boutUuid, periodNum, jamNum, teamNum, starPass),
    ...options,
  });
