import { setLead } from "@/lib/game/jams";
import { MutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useTeamJamAddLead = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...options
}: TeamJamUri & MutationOptions<void, unknown, boolean>) =>
  useMutation({
    mutationFn: (lead: boolean) =>
      setLead(boutUuid, periodNum, jamNum, teamNum, lead),
    ...options,
  });
