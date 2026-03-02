import { setTeam } from "@/lib/game/timeouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useSetTimeoutTeam = (
  boutUuid: string,
  timeoutNum: number,
  options?: MutationOptions<void, unknown, number | null>,
) =>
  useMutation({
    mutationFn: (teamNum: number | null) =>
      setTeam(boutUuid, timeoutNum, teamNum),
    ...options,
  });
