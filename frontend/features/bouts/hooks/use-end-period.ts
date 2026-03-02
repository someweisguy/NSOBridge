import { endPeriod } from "@/lib/game/bouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useEndPeriod = (
  boutUuid: string,
  options?: MutationOptions<void>,
) =>
  useMutation({
    mutationFn: () => endPeriod(boutUuid),
    ...options,
  });
