import { startTimeout } from "@/lib/game/bouts";
import { BoutUri, MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to start a new Timeout in the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StartTimeout mutator.
 */
export const useStartTimeout = ({
  boutUuid,
  ...options
}: BoutUri & MutationOptions<void>) =>
  useMutation({
    mutationFn: () => startTimeout(boutUuid),
    ...options,
  });
