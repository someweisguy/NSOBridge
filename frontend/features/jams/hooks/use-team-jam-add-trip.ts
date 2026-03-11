import { addJamTrip } from "@/lib/game/jams";
import { AppMutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Adds a jam trip to the TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamTrip mutator.
 */
export const useTeamJamAddTrip = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...options
}: TeamJamUri & AppMutationOptions<void, unknown, number>) =>
  useMutation({
    mutationFn: (passes: number) =>
      addJamTrip(boutUuid, periodNum, jamNum, teamNum, passes),
    ...options,
  });
