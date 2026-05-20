import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

interface UseCreateBoutOptions {
  rulesetName: string;
  teamNames?: string[];
}

/**
 * Creates a new Bout that uses the desired ruleset.
 *
 * @returns A Tanstack Mutation object which can fire the create Bout mutator.
 */
export const useCreateBout = ({
  rulesetName,
  teamNames = [],
  ...options
}: UseCreateBoutOptions & AppMutationOptions<string>) => {
  const query = new URLSearchParams({ rulesetName });
  for (const teamName of teamNames) {
    query.append("teamName", teamName);
  }

  return useMutation(
    {
      mutationFn: () => localAPI.put<string>("bout/createBout", { query }),
      ...options,
    },
    queryClient,
  );
};
