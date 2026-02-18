import { Timeout } from "@/lib/game/timeouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useSetTimeoutTeam = (
  timeout: Timeout,
  options?: MutationOptions<void, unknown, number | null>,
) =>
  useMutation({
    mutationFn: (teamNum: number | null) => timeout.setTeam(teamNum),
    ...options,
  });
