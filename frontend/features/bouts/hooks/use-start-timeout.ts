import { startTimeout } from "@/lib/game/bouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useStartTimeout = (
  boutUuid: string,
  options?: MutationOptions<void>,
) =>
  useMutation({
    mutationFn: () => startTimeout(boutUuid),
    ...options,
  });
