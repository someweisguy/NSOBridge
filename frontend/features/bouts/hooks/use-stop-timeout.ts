import { stopTimeout } from "@/lib/game/bouts";
import { BoutUri, AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to stop the current Timeout of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StopTimeout mutator.
 */
export const useStopTimeout = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void>) =>
  useMutation({
    mutationFn: () => stopTimeout(boutUuid),
    ...options,
  });
