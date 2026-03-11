import { stopTimeout } from "@/lib/game/bouts";
import { BoutUri, MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to stop the current Timeout of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StopTimeout mutator.
 */
export const useStopTimeout = ({
  boutUuid,
  ...options
}: BoutUri & Omit<MutationOptions<void>, "mutationFn">) =>
  useMutation({
    mutationFn: () => stopTimeout(boutUuid),
    ...options,
  });
