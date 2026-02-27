import { startJam } from "@/lib/game/bouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useStartJam = (
  boutUuid: string,
  options?: MutationOptions<void>,
) =>
  useMutation({
    mutationFn: () => startJam(boutUuid),
    ...options,
  });
