import { beginPeriod } from "@/lib/game/bouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useBeginPeriod = (
  boutUuid: string,
  options?: MutationOptions<void>,
) =>
  useMutation({
    mutationFn: () => beginPeriod(boutUuid),
    ...options,
  });
