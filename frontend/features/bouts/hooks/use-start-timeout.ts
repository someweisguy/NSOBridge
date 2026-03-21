import { localAPI } from "@/lib/requests";
import { AppMutationOptions, BoutUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to start a new Timeout in the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StartTimeout mutator.
 */
export const useStartTimeout = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void>) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/startTimeout", {
        query: { boutUuid },
      }),
    ...options,
  });
