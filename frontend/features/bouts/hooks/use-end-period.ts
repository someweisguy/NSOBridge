import { localAPI } from "@/lib/requests";
import { AppMutationOptions, BoutUri } from "@/types/query";
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
    mutationFn: () =>
      localAPI.post<void>("bout/endPeriod", { query: { boutUuid } }),
    ...options,
  });
