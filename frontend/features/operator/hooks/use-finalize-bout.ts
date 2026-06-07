import { localAPI } from "@/lib/requests";
import { AppMutationOptions, BoutUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Finalize the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the FinalizeBout mutator.
 */
export const useFinalizeBout = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void>) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/finalize", { query: { boutUuid } }),
    ...options,
  });
