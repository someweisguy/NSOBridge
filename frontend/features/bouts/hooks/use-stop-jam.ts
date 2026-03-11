import { stopJam } from "@/lib/game/bouts";
import { BoutUri, AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to stop the latest Jam of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StopJam mutator.
 */
export const useStopJam = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void>) =>
  useMutation({
    mutationFn: () => stopJam(boutUuid),
    ...options,
  });
