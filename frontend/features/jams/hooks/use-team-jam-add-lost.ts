import { localAPI } from "@/lib/requests";
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
      localAPI.post<void>("bout/addLost", {
        query: {
          boutUuid,
          periodNum,
          jamNum,
          teamNum,
        },
        body: lost,
      }),
    ...options,
  });
