import { stopJam } from "@/lib/game/bouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useStopJam = (boutUuid: string, options?: MutationOptions<void>) =>
  useMutation({
    mutationFn: () => stopJam(boutUuid),
    ...options,
  });
