import { localAPI } from "@/lib/requests";
import { AppMutationOptions, BoutUri } from "@/types/query";
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
    mutationFn: () =>
      localAPI.post<void>("bout/beginPeriod", { query: { boutUuid } }),
    ...options,
  });
