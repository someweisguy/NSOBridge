import { beginPeriod } from "@/lib/game/bouts";
import { BoutUri, AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to begin the Period of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the BeginPeriod mutator.
 */
export const useBeginPeriod = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void>) =>
  useMutation({
    mutationFn: () => beginPeriod(boutUuid),
    ...options,
  });
