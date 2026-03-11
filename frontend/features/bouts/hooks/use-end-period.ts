import { endPeriod } from "@/lib/game/bouts";
import { BoutUri, AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to end the Period of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the EndPeriod mutator.
 */
export const useEndPeriod = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void>) =>
  useMutation({
    mutationFn: () => endPeriod(boutUuid),
    ...options,
  });
