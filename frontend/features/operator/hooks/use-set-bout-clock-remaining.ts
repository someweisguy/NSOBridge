import { localAPI } from "@/lib/requests";
import { AppMutationOptions, BoutUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to set the clock of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the setBoutClockElapsed mutator.
 */
export const useSetBoutClockRemaining = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void, unknown, number>) =>
  useMutation({
    mutationFn: (remaining: number) =>
      localAPI.put<void>("bout/setClockRemaining", {
        query: { boutUuid },
        body: remaining,
      }),
    ...options,
  });
