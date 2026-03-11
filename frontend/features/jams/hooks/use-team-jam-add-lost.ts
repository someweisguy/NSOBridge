import { addJamLost } from "@/lib/game/jams";
import { AppMutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Sets the lost lead Jam status of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamLost mutator.
 */
export const useTeamJamAddLost = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...options
}: TeamJamUri & AppMutationOptions<void, unknown, boolean>) =>
  useMutation({
    mutationFn: (lost: boolean) =>
      addJamLost(boutUuid, periodNum, jamNum, teamNum, lost),
    ...options,
  });
