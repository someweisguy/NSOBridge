import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseTeamJamAddLeadProps extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  jamUuid: string;
  teamNum: number;
}

/**
 * Sets the lead Jam status of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamLead mutator.
 */
export const useTeamJamAddLead = ({
  jamUuid,
  teamNum,
  ...options
}: UseTeamJamAddLeadProps) =>
  useMutation({
    mutationFn: (lead: boolean) =>
      localAPI.post<void>("bout/addLead", {
        query: {
          jamUuid,
          teamNum,
        },
        body: lead,
      }),
    ...options,
  });
