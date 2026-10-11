import { localAPI } from "@/lib/requests";
import { Team } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseUPdateLeadProps extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  team: Team;
}

/**
 * Adds or removes lead jammer status to the active Jam of the specified Team.
 *
 * @returns A Tanstack Mutation object which can fire the updateLead mutator.
 */
export const useUpdateLead = ({ team, ...options }: UseUPdateLeadProps) =>
  useMutation({
    mutationFn: (lead: boolean) =>
      localAPI.post<void>("bout/team/lead", {
        query: { teamUuid: team.uuid },
        body: lead,
      }),
    ...options,
  });
