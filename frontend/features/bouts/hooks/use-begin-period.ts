import { beginPeriod } from "@/lib/game/bouts";
import { BoutUri, MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to begin the Period of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the BeginPeriod mutator.
 */
export const useBeginPeriod = ({
  boutUuid,
  ...options
}: BoutUri & Omit<MutationOptions<void>, "mutationFn">) =>
  useMutation({
    mutationFn: () => beginPeriod(boutUuid),
    ...options,
  });
