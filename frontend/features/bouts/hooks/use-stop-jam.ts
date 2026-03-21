import { localAPI } from "@/lib/requests";
import { AppMutationOptions, BoutUri } from "@/types/query";
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
    mutationFn: () =>
      localAPI.post<void>("bout/stopJam", { query: { boutUuid } }),
    ...options,
  });
