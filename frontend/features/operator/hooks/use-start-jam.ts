import { localAPI } from "@/lib/requests";
import { AppMutationOptions, BoutUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to start the latest Jam of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StartJam mutator.
 */
export const useStartJam = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void>) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/startJam", { query: { boutUuid } }),
    ...options,
  });
