import { Bout } from "@/lib/game/bouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useStopJam = (bout: Bout, options?: MutationOptions<void>) =>
  useMutation({
    mutationFn: () => bout.stopJam(),
    ...options,
  });
