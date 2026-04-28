import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { AppQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches all roller derby rulesets that the server supports. These ruleset names are
 * used when instantiating a new Bout.
 *
 * @returns a Tanstack useQuery object containing supported ruleset names.
 */
export const useSuspenseAllRulesetNames = (
  options?: AppQueryOptions<string[]>,
) =>
  useSuspenseQuery<string[]>(
    {
      queryKey: ["allRulesetNames"],
      queryFn: () => localAPI.get("bout/allRulesetNames"),
      ...options,
    },
    queryClient,
  );
