import queryClient, { invalidateCacheParents } from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { boutKeys } from "@/utils/query-keys";
import { useMutation } from "@tanstack/react-query";

interface useDeleteBoutOptions {
  boutUuid: string;
}

/**
 * Delete a Bout.
 *
 * @returns A Tanstack Mutation object which can fire the delete Bout mutator.
 */
export const useDeleteBout = ({
  boutUuid,
  ...options
}: useDeleteBoutOptions & AppMutationOptions<void>) => {
  return useMutation(
    {
      mutationFn: () =>
        localAPI
          .delete<void>("bout", { query: { boutUuid } })
          .then(() => invalidateCacheParents(boutKeys.one(boutUuid))),
      ...options,
    },
    queryClient,
  );
};
