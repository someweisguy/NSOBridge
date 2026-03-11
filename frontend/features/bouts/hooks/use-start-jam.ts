import { startJam } from "@/lib/game/bouts";
import { BoutUri, MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to start the latest Jam of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StartJam mutator.
 */
export const useStartJam = ({
  boutUuid,
  ...options
}: BoutUri & MutationOptions<void>) =>
  useMutation({
    mutationFn: () => startJam(boutUuid),
    ...options,
  });
