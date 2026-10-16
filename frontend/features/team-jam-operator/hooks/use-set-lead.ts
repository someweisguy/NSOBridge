import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetLeadOptions extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  teamUuid: string;
}

/**
 * Adds or removes lead jammer status to the active Jam of the specified Team.
 *
 * @returns A Tanstack Mutation object which can fire the setLead mutator.
 */
export const useSetLead = ({ teamUuid, ...options }: UseSetLeadOptions) =>
  useMutation({
    mutationFn: (lead: boolean) =>
      localAPI.post<void>("bout/team/lead", {
        query: { teamUuid },
        body: lead,
      }),
    ...options,
  });
