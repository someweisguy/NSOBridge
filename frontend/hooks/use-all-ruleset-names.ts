import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { AppQueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches all roller derby rulesets that the server supports. These ruleset names are
 * used when instantiating a new Bout.
 *
 * @returns a Tanstack useQuery object containing supported ruleset names.
 */
export const useAllRulesetNames = (options?: AppQueryOptions<string[]>) =>
  useQuery<string[]>(
    {
      queryKey: ["allRulesetNames"],
      queryFn: () => localAPI.get("bout/allRulesetNames"),
      ...options,
    },
    queryClient,
  );
