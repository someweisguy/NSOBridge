import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { boutKeys } from "@/utils/query-keys";
import { useMutation } from "@tanstack/react-query";

interface UseCreateBoutOptions {
  seriesUuid: string;
  rulesetName: string;
  teamNames?: string[];
  setActive?: boolean;
}

/**
 * Creates a new Bout that uses the desired ruleset.
 *
 * @returns A Tanstack Mutation object which can fire the create Bout mutator.
 */
export const useCreateBout = ({
  seriesUuid,
  rulesetName,
  teamNames = [],
  // setActive = true,
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
          queryClient.setQueryData(boutKeys.one(bout.uuid), bout);
          return bout;
        }),
      ...options,
    },
    queryClient,
  );
};
