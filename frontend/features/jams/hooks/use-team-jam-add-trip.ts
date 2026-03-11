import { addTrip } from "@/lib/game/jams";
import { MutationOptions, TeamJamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

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
