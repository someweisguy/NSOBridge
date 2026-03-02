import { stopTimeout } from "@/lib/game/bouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useStopTimeout = (
  boutUuid: string,
  options?: MutationOptions<void>,
) =>
  useMutation({
    mutationFn: () => stopTimeout(boutUuid),
    ...options,
  });
