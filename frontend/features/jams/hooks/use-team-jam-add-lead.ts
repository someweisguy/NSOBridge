import { localAPI } from "@/lib/requests";
import { AppMutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Sets the lead Jam status of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamLead mutator.
 */
export const useTeamJamAddLead = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...options
}: TeamJamUri & AppMutationOptions<void, unknown, boolean>) =>
  useMutation({
    mutationFn: (lead: boolean) =>
      localAPI.post<void>("jam/setLead", {
        query: {
          boutUuid,
          periodNum,
          jamNum,
          teamNum,
        },
        body: lead,
      }),
    ...options,
  });
