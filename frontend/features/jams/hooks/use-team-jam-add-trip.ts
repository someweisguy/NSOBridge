import { localAPI } from "@/lib/requests";
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
      localAPI.post<void>("bout/addTrip", {
        query: {
          boutUuid,
          periodNum,
          jamNum,
          teamNum,
        },
        body: passes,
      }),
    ...options,
  });
