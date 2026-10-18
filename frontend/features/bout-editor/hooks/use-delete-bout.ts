import queryClient, { invalidateCacheParents } from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { boutKeys } from "@/utils/query-keys";
import { useMutation } from "@tanstack/react-query";

interface useDeleteBoutOptions {
  uuid: string;
}

/**
 * Delete a Bout.
 *
 * @returns A Tanstack Mutation object which can fire the delete Bout mutator.
 */
export const useDeleteBout = ({
  uuid,
  ...options
}: useDeleteBoutOptions & AppMutationOptions<void>) => {
  return useMutation(
    {
      mutationFn: () =>
        localAPI
          .delete<void>("bout", { query: { uuid } })
          .then(() => invalidateCacheParents(boutKeys.one(uuid))),
      ...options,
    },
    queryClient,
  );
};
