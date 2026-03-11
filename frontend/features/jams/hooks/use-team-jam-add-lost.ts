import { setLost } from "@/lib/game/jams";
import { MutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Sets the lost lead Jam status of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the setLost mutator.
 */
export const useTeamJamAddLost = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...options
}: TeamJamUri & MutationOptions<void, unknown, boolean>) =>
  useMutation({
    mutationFn: (lost: boolean) =>
      setLost(boutUuid, periodNum, jamNum, teamNum, lost),
    ...options,
  });
