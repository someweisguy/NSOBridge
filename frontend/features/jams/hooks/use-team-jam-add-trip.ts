import { addTrip } from "@/lib/game/jams";
import { MutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Adds a jam trip to the TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addTrip mutator.
 */
export const useTeamJamAddTrip = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...options
}: TeamJamUri & MutationOptions<void, unknown, number>) =>
  useMutation({
    mutationFn: (passes: number) =>
      addTrip(boutUuid, periodNum, jamNum, teamNum, passes),
    ...options,
  });
