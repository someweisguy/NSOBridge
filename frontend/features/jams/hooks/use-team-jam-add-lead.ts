import { setLead } from "@/lib/game/jams";
import { AppMutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Sets the lead Jam status of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the setLead mutator.
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
      setLead(boutUuid, periodNum, jamNum, teamNum, lead),
    ...options,
  });
