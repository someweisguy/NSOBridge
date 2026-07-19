import queryClient, { invalidateCacheParents } from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { boutKeys, seriesKeys } from "@/utils/query-keys";
import { useMutation } from "@tanstack/react-query";

interface UseCreateBoutOptions {
  rulesetName: string;
  seriesUuid: string;
  teamNames?: string[];
}

/**
 * Creates a new Bout that uses the desired ruleset.
 *
 * @returns A Tanstack Mutation object which can fire the create Bout mutator.
 */
export const useCreateBout = ({
  rulesetName,
  seriesUuid,
  teamNames = [],
  ...options
}: UseCreateBoutOptions & AppMutationOptions<Bout>) => {
  const query = new URLSearchParams({ rulesetName });
  query.append("seriesUuid", seriesUuid);
  for (const teamName of teamNames) {
    query.append("teamName", teamName);
  }

  return useMutation(
    {
      mutationFn: () =>
        localAPI.put<Bout>("bout", { query }).then((bout: Bout) => {
          invalidateCacheParents(seriesKeys.one(seriesUuid));
          queryClient.setQueriesData(
            { queryKey: boutKeys.one(bout.uuid) },
            bout,
          );
          return bout;
        }),
      ...options,
    },
    queryClient,
  );
};
